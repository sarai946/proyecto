import shutil
import os

p = r"C:/Users/PC/Downloads/yary_complete_project (2)/fronend/assets/img"
files = [
    ('img_1.jpg','img_1.png'),
    ('img_2.jpg','img_2.png'),
    ('ima_3.jpg','img_3.png'),
    ('img_4.jpg','img_4.png'),
    ('img_5.jpg','img_5.png'),
]

created = []
for src, dst in files:
    sa = os.path.join(p, src)
    sb = os.path.join(p, dst)
    try:
        if os.path.exists(sa):
            shutil.copyfile(sa, sb)
            created.append(dst)
    except Exception as e:
        print('ERROR copying', sa, '->', sb, e)

print('Created PNG files:', created)
