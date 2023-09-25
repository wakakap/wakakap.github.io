import os
import random

for i in range(20):
    title = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=5))
    filename = f"{title}.md"
    with open(filename, 'w') as f:
        f.write("This is a sample file.")
    print(f"Created {filename}")
