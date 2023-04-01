

with open('python/DAYBREAK FRONTLINE.osu', 'r',encoding='utf-8') as osu_file:
    found_hit_objects = False
    for line in osu_file:
        if '[HitObjects]' in line:
            found_hit_objects = True
        elif found_hit_objects and line.strip() == '':
            break
        elif found_hit_objects:
            data = line.strip().split(',')
            with open('output.txt', 'a',encoding='utf-8') as output_file:
                output_file.write(str(int(data[2])/1000) + '\n')
