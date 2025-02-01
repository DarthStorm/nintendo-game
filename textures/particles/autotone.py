from PIL import Image
from random import randint
import os
os.chdir("textures")
fp = "tiles\\stone.png"
img = Image.open(fp)

px = img.load()

w,h = img.size

def no_alpha(img, px, w, h,):
    for i in range(w):
        for j in range(h):
        # getting the RGB pixel value.
            r, g, b, p = img.getpixel((i, j))
          
        # Apply formula of grayscale:
  
        # setting the pixel value.
            px[i, j] = (int(255), int(255), int(255),0 if p == 0 else 255)



def autotone(strength):
    for i in range(w):
        for j in range(h):
        # getting the RGB pixel value.
            r, g, b, p = img.getpixel((i, j))
            r += randint(-strength,strength)
            g += randint(-strength,strength)
            b += randint(-strength,strength)

            r = abs(r)
            g = abs(g)
            b = abs(b)

        # Apply formula of grayscale:
  
        # setting the pixel value.
            px[i, j] = (int(r), int(g), int(b),p)

autotone(3)

img.save(fp,format="png")