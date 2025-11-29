import os
import shutil

IMG_DIR = r"C:\Users\PC\Downloads\yary_complete_project (2)\fronend\assets\img"

# Mapeo de nombres esperados
mapeo = {
    "img_1.jpg": "img_1.png",
    "img_2.jpg": "img_2.png",
    "ima_3.jpg": "img_3.png",  # typo en el nombre original
    "img_4.jpg": "img_4.png",
    "img_5.jpg": "img_5.png"
}

for jpg, png in mapeo.items():
    src = os.path.join(IMG_DIR, jpg)
    dst = os.path.join(IMG_DIR, png)
    if os.path.exists(src):
        shutil.copyfile(src, dst)
        print(f"Copiado: {src} -> {dst}")
    else:
        print(f"No existe: {src}")
print("Listo. Ahora las imágenes .png deberían cargar.")
