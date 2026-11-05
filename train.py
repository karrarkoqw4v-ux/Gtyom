import sys, time, torch
from model import GPT

data_path = sys.argv[1] if len(sys.argv) > 1 else "data.txt"
steps = int(sys.argv[2]) if len(sys.argv) > 2 else 3000
dev = "cuda" if torch.cuda.is_available() else "cpu"
text = open(data_path, encoding="utf-8").read()
chars = sorted(set(text))
stoi = {c: i for i, c in enumerate(chars)}
data = torch.tensor([stoi[c] for c in text], dtype=torch.long)
n = int(0.9 * len(data))
train, val = data[:n], data[n:]
CTX, BS = 128, 32
cfg = dict(vocab=len(chars), ctx=CTX, d=192, layers=4, heads=4)
model = GPT(**cfg).to(dev)
print(f"device={dev} chars={len(text)} vocab={len(chars)} "
      f"params={sum(p.numel() for p in model.parameters())/1e6:.2f}M")
opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.1)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, steps)


def batch(d):
    ix = torch.randint(len(d) - CTX - 1, (BS,))
    x = torch.stack([d[i:i + CTX] for i in ix])
    y = torch.stack([d[i + 1:i + CTX + 1] for i in ix])
    return x.to(dev), y.to(dev)


@torch.no_grad()
def evaluate():
    model.eval()
    l = sum(model(*batch(val))[1].item() for _ in range(10)) / 10
    model.train()
    return l


t0 = time.time()
for step in range(1, steps + 1):
    _, loss = model(*batch(train))
    opt.zero_grad()
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    opt.step()
    sched.step()
    if step % 100 == 0:
        print(f"step {step}/{steps} train {loss.item():.3f} val {evaluate():.3f} "
              f"({time.time()-t0:.0f}s)", flush=True)
torch.save({"model": model.state_dict(), "cfg": cfg, "chars": chars}, "model.pt")
print("saved model.pt")
