import os
import qrcode
from PIL import Image

def test():
    frontend_public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app', 'public'))
    logo_path = os.path.join(frontend_public_dir, 'images', 'restaurant-logo.jpg')
    print("Logo path:", logo_path, "Exists:", os.path.exists(logo_path))
    
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data("http://localhost:3000/r/demo-restaurant")
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
    
    if os.path.exists(logo_path):
        logo = Image.open(logo_path)
        img_w, img_h = img.size
        logo_max_size = int(img_w / 4.0)
        if hasattr(Image, 'Resampling'):
            logo.thumbnail((logo_max_size, logo_max_size), Image.Resampling.LANCZOS)
        else:
            logo.thumbnail((logo_max_size, logo_max_size), Image.ANTIALIAS)
        
        logo_w, logo_h = logo.size
        pos_w = (img_w - logo_w) // 2
        pos_h = (img_h - logo_h) // 2
        
        if logo.mode == 'RGBA':
            logo_bg = Image.new('RGB', logo.size, 'white')
            logo_bg.paste(logo, (0, 0), logo)
            img.paste(logo_bg, (pos_w, pos_h))
        else:
            img.paste(logo, (pos_w, pos_h))
        
        output_path = os.path.join(os.path.dirname(__file__), 'test_qr.png')
        img.save(output_path)
        print("QR with logo saved to", output_path)

test()
