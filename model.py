import torch, torch.nn as nn, torch.nn.functional as F


class Block(nn.Module):
    def __init__(s, d, h, drop):
        super().__init__()
        s.h = h
        s.ln1, s.ln2 = nn.LayerNorm(d), nn.LayerNorm(d)
        s.qkv = nn.Linear(d, 3 * d)
        s.proj = nn.Linear(d, d)
        s.mlp = nn.Sequential(nn.Linear(d, 4 * d), nn.GELU(), nn.Linear(4 * d, d))
        s.drop = nn.Dropout(drop)

    def forward(s, x):
        B, T, C = x.shape
        q, k, v = s.qkv(s.ln1(x)).split(C, dim=2)
        q, k, v = (t.view(B, T, s.h, C // s.h).transpose(1, 2) for t in (q, k, v))
        y = F.scaled_dot_product_attention(q, k, v, is_causal=True)
        x = x + s.drop(s.proj(y.transpose(1, 2).reshape(B, T, C)))
        return x + s.drop(s.mlp(s.ln2(x)))


class GPT(nn.Module):
    def __init__(s, vocab, ctx=128, d=192, layers=4, heads=4, drop=0.1):
        super().__init__()
        s.ctx = ctx
        s.tok = nn.Embedding(vocab, d)
        s.pos = nn.Embedding(ctx, d)
        s.blocks = nn.ModuleList(Block(d, heads, drop) for _ in range(layers))
        s.ln = nn.LayerNorm(d)
        s.head = nn.Linear(d, vocab, bias=False)
        s.head.weight = s.tok.weight
        s.apply(s._init)

    def _init(s, m):
        if isinstance(m, (nn.Linear, nn.Embedding)):
            nn.init.normal_(m.weight, std=0.02)
            if getattr(m, "bias", None) is not None:
                nn.init.zeros_(m.bias)

    def forward(s, idx, targets=None):
        T = idx.shape[1]
        x = s.tok(idx) + s.pos(torch.arange(T, device=idx.device))
        for b in s.blocks:
            x = b(x)
        logits = s.head(s.ln(x))
        loss = None if targets is None else F.cross_entropy(
            logits.view(-1, logits.size(-1)), targets.view(-1))
        return logits, loss

    @torch.no_grad()
    def generate(s, idx, n, temp=0.8, top_k=40):
        for _ in range(n):
            lg, _ = s(idx[:, -s.ctx:])
            lg = lg[:, -1] / temp
            if top_k:
                v, _ = torch.topk(lg, min(top_k, lg.size(-1)))
                lg[lg < v[:, [-1]]] = -float("inf")
            idx = torch.cat([idx, torch.multinomial(F.softmax(lg, -1), 1)], 1)
        return idx
