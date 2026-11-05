import sys, torch
from model import GPT

ck = torch.load("model.pt", map_location="cpu")
m = GPT(**ck["cfg"])
m.load_state_dict(ck["model"])
m.eval()
stoi = {c: i for i, c in enumerate(ck["chars"])}
prompt = sys.argv[1] if len(sys.argv) > 1 else "\n"
n = int(sys.argv[2]) if len(sys.argv) > 2 else 300
idx = torch.tensor([[stoi.get(c, 0) for c in prompt]])
print("".join(ck["chars"][i] for i in m.generate(idx, n)[0].tolist()))
