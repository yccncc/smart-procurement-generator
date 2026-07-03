import http.server
import json
import os
import urllib.parse
import time
import random
import datetime
import socket

PORT = 3000

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class ProcurementRequestHandler(http.server.BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        # 1. API - Get all procurements
        if path == '/api/procurements':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            with open('data/procurements.json', 'r', encoding='utf-8') as f:
                self.wfile.write(f.read().encode('utf-8'))
            return
            
        # 2. API - Get single procurement
        elif path.startswith('/api/procurements/'):
            prc_id = path.split('/')[-1]
            with open('data/procurements.json', 'r', encoding='utf-8') as f:
                items = json.load(f)
            item = next((i for i in items if i['id'] == prc_id), None)
            if item:
                self.send_response(200)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps(item, ensure_ascii=False).encode('utf-8'))
            else:
                self.send_response(404)
                self.end_headers()
            return
            
        # 3. API - Get all laws
        elif path == '/api/laws':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            with open('data/laws.json', 'r', encoding='utf-8') as f:
                self.wfile.write(f.read().encode('utf-8'))
            return
            
        # 4. API - Search laws
        elif path == '/api/laws/search':
            query_params = urllib.parse.parse_qs(parsed_url.query)
            q = query_params.get('q', [''])[0].strip().lower()
            
            with open('data/laws.json', 'r', encoding='utf-8') as f:
                laws = json.load(f)
                
            if not q:
                results = laws
            else:
                tokens = q.split()
                results = []
                for law in laws:
                    match = True
                    for t in tokens:
                        in_title = t in law.get('title', '').lower()
                        in_content = t in law.get('content', '').lower()
                        in_keywords = any(t in kw.lower() for kw in law.get('keywords', []))
                        in_category = t in law.get('category', '').lower()
                        if not (in_title or in_content or in_keywords or in_category):
                            match = False
                            break
                    if match:
                        results.append(law)
                        
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(results, ensure_ascii=False).encode('utf-8'))
            return
            
        # 5. Serve static files from /public
        else:
            if path == '/':
                path = '/index.html'
            
            # Map path to public directory
            file_path = os.path.join('public', path.lstrip('/'))
            if os.path.exists(file_path) and not os.path.isdir(file_path):
                self.send_response(200)
                
                # Content types mapping
                if file_path.endswith('.html'):
                    self.send_header('Content-type', 'text/html; charset=utf-8')
                elif file_path.endswith('.css'):
                    self.send_header('Content-type', 'text/css; charset=utf-8')
                elif file_path.endswith('.js'):
                    self.send_header('Content-type', 'application/javascript; charset=utf-8')
                elif file_path.endswith('.json'):
                    self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"404 Not Found")

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        if path == '/api/procurements':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            payload = json.loads(post_data.decode('utf-8'))
            
            # Generate unique ID
            payload['id'] = 'prc_' + hex(int(time.time()))[2:] + str(random.randint(100, 999))
            now_iso = datetime.datetime.now().isoformat()
            payload['createdAt'] = now_iso
            payload['updatedAt'] = now_iso
            
            with open('data/procurements.json', 'r+', encoding='utf-8') as f:
                items = json.load(f)
                items.append(payload)
                f.seek(0)
                json.dump(items, f, ensure_ascii=False, indent=2)
                f.truncate()
                
            self.send_response(201)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(payload, ensure_ascii=False).encode('utf-8'))
            return
        else:
            self.send_response(404)
            self.end_headers()

    def do_PUT(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        if path.startswith('/api/procurements/'):
            prc_id = path.split('/')[-1]
            content_length = int(self.headers['Content-Length'])
            put_data = self.rfile.read(content_length)
            payload = json.loads(put_data.decode('utf-8'))
            
            with open('data/procurements.json', 'r+', encoding='utf-8') as f:
                items = json.load(f)
                index = next((idx for idx, item in enumerate(items) if item['id'] == prc_id), -1)
                
                if index != -1:
                    now_iso = datetime.datetime.now().isoformat()
                    payload['id'] = prc_id
                    payload['createdAt'] = items[index].get('createdAt', now_iso)
                    payload['updatedAt'] = now_iso
                    items[index] = payload
                    
                    f.seek(0)
                    json.dump(items, f, ensure_ascii=False, indent=2)
                    f.truncate()
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(json.dumps(payload, ensure_ascii=False).encode('utf-8'))
                else:
                    self.send_response(404)
                    self.end_headers()
            return
        else:
            self.send_response(404)
            self.end_headers()

    def do_DELETE(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        if path.startswith('/api/procurements/'):
            prc_id = path.split('/')[-1]
            
            with open('data/procurements.json', 'r+', encoding='utf-8') as f:
                items = json.load(f)
                new_items = [i for i in items if i['id'] != prc_id]
                
                if len(new_items) < len(items):
                    f.seek(0)
                    json.dump(new_items, f, ensure_ascii=False, indent=2)
                    f.truncate()
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "刪除成功"}, ensure_ascii=False).encode('utf-8'))
                else:
                    self.send_response(404)
                    self.end_headers()
            return
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, ProcurementRequestHandler)
    local_ip = get_local_ip()
    print("="*60)
    print(f"Smart Procurement Generator (Python HTTP Server) is running!")
    print(f"Local Host URL (This PC):  http://localhost:{PORT}")
    print(f"Network LAN URL (Others): http://{local_ip}:{PORT}")
    print("="*60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
