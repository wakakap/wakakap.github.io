# 帮我写个python代码，读取一个文件的每行，如果检索到'[HitObjects]'从下一行开始读取直到空行，假设这些有效行被称为lines。先读取每行以','分隔的第三个数据f_data写入txt中。再继续往改行后方扫描，如果'|'存在，则以'|'为分隔符把该行line分成几部分line_parts，检测除去第一部分后的其他部分，检测line_part[i](i>0)是否存在','分隔的第三个数据temp，若存在就让s_data = temp+f_data，并写入txt中。按描述顺序写入txt，每个数据占一行，注意都用utf-8写入和读取。
with open('python/mary - DAYBREAK FRONTLINE (Jerry) [Cdh\'s Futsuu].osu', 'r', encoding='utf-8') as file:
    flag = False
    for line in file:
        line = line.strip()
        if line == '[HitObjects]':
            flag = True
            continue
        if flag and line == '':
            break
        if flag:
            # 第一个时间
            f_data = line.split(',')[2]
            with open('output.txt', 'a', encoding='utf-8') as output_file:
                output_file.write(str(int(f_data)/1000) + '\n')
            
            line_parts = line.split('|')
            for i in range(1, len(line_parts)):
                if len(line_parts[i].split(','))>2:
                    temp = line_parts[i].split(',')[2]
                    # 第二个时间
                    s_data = float(temp) + float(f_data)
                    with open('output.txt', 'a', encoding='utf-8') as output_file:
                        output_file.write(str(int(s_data)/1000) + '\n')




## 只转换每行第一个时间，忽略长建
# with open('python/mary - DAYBREAK FRONTLINE (Jerry) [Cdh\'s Futsuu].osu', 'r',encoding='utf-8') as osu_file:
#     found_hit_objects = False
#     for line in osu_file:
#         if '[HitObjects]' in line:
#             found_hit_objects = True
#         elif found_hit_objects and line.strip() == '':
#             break
#         elif found_hit_objects:
#             data = line.strip().split(',')
#             with open('output.txt', 'a',encoding='utf-8') as output_file:
#                 output_file.write(str(int(data[2])/1000) + '\n')

            