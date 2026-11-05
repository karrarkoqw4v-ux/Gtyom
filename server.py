"""سيرفر محلي يربط الواجهة (index.html) بنموذج mini-gpt المدرب.

التشغيل:
    pip install torch
    python server.py --model model.pt --port 8000
ثم افتح index.html واختر "النموذج المحلي" من الإعدادات.
"""
import argparse, json, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import torch

sys.path.insert(0, ".")
from model import GPT  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--model", default="model.pt")
ap.add_argument("--port", type=int, default=8000)
ap.add_argument("--temp", type=float, default=0.8)
args = ap.parse_args()

ck = torch.load(args.model, map_location="cpu")
net = GPT(**ck["cfg"])
net.load_state_dict(ck["model"])
net.eval()
chars = ck["chars"]
stoi = {c: i for i, c in enumerate(chars)}


def generate(prompt: str, n: int) -> str:
    ids = [stoi[c] for c in prompt if c in stoi] or [stoi.get("\n", 0)]
    out = net.generate(torch.tensor([ids]), n, temp=args.temp)[0].tolist()
    return "".join(chars[i] for i in out[len(ids):])


class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path != "/generate":
            self.send_response(404)
            self.end_headers()
            return
        body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        n = min(int(body.get("max_tokens", 300)), 1000)
        text = generate(body.get("prompt", ""), n)
        data = json.dumps({"text": text}, ensure_ascii=False).encode()
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


print(f"serving on http://localhost:{args.port}")
ThreadingHTTPServer(("0.0.0.0", args.port), H).serve_forever()
