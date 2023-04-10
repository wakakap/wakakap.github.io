import os
import random

for i in range(20):
    year = random.randint(2022, 2023)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    date_str = f"{year}-{month:02d}-{day:02d}"
    title = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=5))
    filename = f"{date_str}-{title}.md"
    with open(filename, 'w') as f:
        f.write("This is a sample file.")
    print(f"Created {filename}")
