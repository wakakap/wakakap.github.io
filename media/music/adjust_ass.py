import re

def srt_time_to_ass_time_format(srt_time_str):
    """
    将SRT时间字符串 (HH:MM:SS,mmm) 转换为 ASS时间字符串 (H:MM:SS.cc)。
    例如: "00:00:42,971" -> "0:00:42.97"
    """
    match = re.match(r"(\d{2}):(\d{2}):(\d{2}),(\d{3})", srt_time_str)
    if not match:
        # print(f"    错误: 无效的SRT时间组件格式: {srt_time_str}") # 已注销
        return "0:00:00.00" 

    h, m, s, ms_str = match.groups()
    
    h_int = int(h)
    ms_int = int(ms_str)
    
    # 将毫秒转换为厘秒 (百分之一秒)，通过截断方式
    cs = ms_int // 10 
    
    # 格式: H:MM:SS.cc (H 不补零, MM, SS 两位, cc 补零到两位)
    return f"{h_int}:{m}:{s}.{cs:02d}"

def process_subtitle_files(srt_filepath, ass_filepath, output_ass_filepath):
    # print(f"开始字幕处理...") # 已注销
    # print(f"SRT 文件: {srt_filepath}") # 已注销
    # print(f"ASS 文件: {ass_filepath}") # 已注销
    # print(f"输出 ASS 文件: {output_ass_filepath}") # 已注销

    srt_timestamp_pairs = []
    try:
        # 使用 utf-8-sig 来处理可能存在的BOM (Byte Order Mark)
        with open(srt_filepath, 'r', encoding='utf-8-sig') as f_srt:
            srt_lines = f_srt.readlines()
        
        # print(f"\n从 SRT 文件提取时间戳...") # 已注销
        for line_content in srt_lines:
            stripped_line = line_content.strip()
            match = re.fullmatch(r"(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})", stripped_line)
            if match:
                start_time, end_time = match.groups()
                srt_timestamp_pairs.append((start_time, end_time))
        
        # print(f"在 SRT 文件中找到 {len(srt_timestamp_pairs)} 个时间戳对。") # 已注销
        # if srt_timestamp_pairs: # 已注销
            # print(f"  SRT 时间戳对示例: {srt_timestamp_pairs[0][0]} --> {srt_timestamp_pairs[0][1]}") # 已注销
        # else: # 已注销
            # print("警告: 未从 SRT 文件中提取到时间戳。ASS 文件中的 Japanese Dialogue 行的时间将不会被修改。") # 已注销
            pass

    except FileNotFoundError:
        # print(f"错误: SRT 文件未找到于 {srt_filepath}") # 已注销
        return 
    except Exception: 
        # print(f"错误: 读取或解析 SRT 文件 {srt_filepath} 时发生错误: {e}") # 已注销 (e 未定义，因为被注释)
        return 

    new_ass_lines = []
    srt_time_idx = 0 
    
    last_japanese_ass_start_time = None 
    last_japanese_ass_end_time = None   

    try:
        with open(ass_filepath, 'r', encoding='utf-8-sig') as f_ass:
            ass_lines = f_ass.readlines()
        
        # print(f"\n处理 ASS 文件: {ass_filepath}") # 已注销
        
        for line in ass_lines: 
            line_stripped_for_check = line.strip() 
            
            if line_stripped_for_check.startswith("Dialogue:"):
                if "Japanese" in line: 
                    # print(f"\n在原始 ASS 文件行 ... 找到 'Japanese' Dialogue 行: {line_stripped_for_check}") # 已注销
                    
                    if srt_time_idx < len(srt_timestamp_pairs):
                        srt_start_str, srt_end_str = srt_timestamp_pairs[srt_time_idx]
                        # print(f"  使用 SRT 时间戳序号 ...: {srt_start_str} --> {srt_end_str}") # 已注销
                        
                        ass_start_time_from_srt = srt_time_to_ass_time_format(srt_start_str)
                        ass_end_time_from_srt = srt_time_to_ass_time_format(srt_end_str)
                        
                        # if ass_start_time_from_srt == "0:00:00.00" and srt_start_str != "00:00:00,000": # 已注销
                            # print(f"    警告: SRT 开始时间 '{srt_start_str}' 转换可能存在问题。") # 已注销
                        # if ass_end_time_from_srt == "0:00:00.00" and srt_end_str != "00:00:00,000": # 已注销
                            # print(f"    警告: SRT 结束时间 '{srt_end_str}' 转换可能存在问题。") # 已注销
                        # print(f"    转换为 ASS 时间格式: 开始='{ass_start_time_from_srt}', 结束='{ass_end_time_from_srt}'") # 已注销
                        
                        comma_indices = []
                        current_pos = -1
                        for _ in range(3): 
                            current_pos = line.find(',', current_pos + 1)
                            if current_pos == -1:
                                break
                            comma_indices.append(current_pos)

                        if len(comma_indices) == 3:
                            # original_ass_start = line[comma_indices[0] + 1 : comma_indices[1]] # 已注销
                            # original_ass_end = line[comma_indices[1] + 1 : comma_indices[2]] # 已注销
                            # print(f"    原始 ASS Dialogue 时间: 开始='{original_ass_start}', 结束='{original_ass_end}'") # 已注销

                            part_before_first_comma = line[:comma_indices[0]]
                            part_after_third_comma = line[comma_indices[2]:]

                            modified_line = f"{part_before_first_comma},{ass_start_time_from_srt},{ass_end_time_from_srt}{part_after_third_comma}"
                            
                            new_ass_lines.append(modified_line)
                            # print(f"    修改后的 Dialogue 行: {modified_line.strip()}") # 已注销
                            srt_time_idx += 1
                            
                            last_japanese_ass_start_time = ass_start_time_from_srt 
                            last_japanese_ass_end_time = ass_end_time_from_srt
                        else:
                            # print(f"    警告: Dialogue 行 '{line_stripped_for_check}' 的逗号数量少于3个...保留原始行。") # 已注销
                            new_ass_lines.append(line) 
                    else: 
                        # print(f"  SRT 时间戳已用完 ...保留原始行。") # 已注销
                        new_ass_lines.append(line)
                
                else: # Dialogue line WITHOUT "Japanese"
                    if last_japanese_ass_start_time is not None and last_japanese_ass_end_time is not None:
                        comma_indices = []
                        current_pos = -1
                        for _ in range(3):
                            current_pos = line.find(',', current_pos + 1)
                            if current_pos == -1:
                                break
                            comma_indices.append(current_pos)

                        if len(comma_indices) == 3:
                            # original_ass_start = line[comma_indices[0] + 1 : comma_indices[1]] # 已注销
                            # original_ass_end = line[comma_indices[1] + 1 : comma_indices[2]] # 已注销
                            # print(f"    Applying last Japanese times to non-Japanese Dialogue...") # 已注销
                            # print(f"    Original non-Japanese ASS Dialogue 时间: 开始='{original_ass_start}', 结束='{original_ass_end}'") # 已注销

                            part_before_first_comma = line[:comma_indices[0]]
                            part_after_third_comma = line[comma_indices[2]:]

                            modified_line = f"{part_before_first_comma},{last_japanese_ass_start_time},{last_japanese_ass_end_time}{part_after_third_comma}"
                            new_ass_lines.append(modified_line)
                            # print(f"    修改后的非Japanese Dialogue 行: {modified_line.strip()}") # 已注销
                        else: 
                            # print(f"    警告: 非Japanese Dialogue 行 '{line_stripped_for_check}' 的逗号数量少于3个...保留原始行。") # 已注销
                            new_ass_lines.append(line)
                    else: 
                        # print(f"    无先前成功修改的Japanese行时间可用，非Japanese Dialogue行 '{line_stripped_for_check}' 保留原始时间。") # 已注销
                        new_ass_lines.append(line)
            else: 
                new_ass_lines.append(line) 
        
        # print(f"\nASS 文件处理完成。") # 已注销
        # print(f"找到 'Japanese' Dialogue 行总数: ...") # 已注销
        # print(f"已修改的 'Japanese' Dialogue 行总数: ...") # 已注销
        # print(f"已使用的 SRT 时间戳对总数: {srt_time_idx}") # 已注销

    except FileNotFoundError:
        # print(f"错误: ASS 文件未找到于 {ass_filepath}") # 已注销
        return 
    except Exception: 
        # print(f"错误: 读取或处理 ASS 文件 {ass_filepath} 时发生错误: {e}") # 已注销
        return 

    try:
        with open(output_ass_filepath, 'w', encoding='utf-8-sig') as f_out:
            f_out.writelines(new_ass_lines) 
        # print(f"\n成功将修改后的 ASS 内容保存到: {output_ass_filepath}") # 已注销
    except Exception: 
        # print(f"错误: 写入输出 ASS 文件 {output_ass_filepath} 时发生错误: {e}") # 已注销
        return

# --- 使用示例 ---
if __name__ == '__main__':
    # 请将以下文件名替换为您实际的SRT和ASS文件名（或路径）
    input_srt_file = "media/music/output.srt"  # 您的SRT文件名
    input_ass_file = "media/music/紅蓮の弓矢.ass"  # 您的ASS文件名
    output_ass_file = "media/music/紅蓮の弓矢cccc.ass" # 您希望保存的输出文件名

    # print(f"准备处理文件: \n  SRT: {input_srt_file}\n  ASS: {input_ass_file}\n  输出: {output_ass_file}") # 已注销
    # print("运行处理函数...\n") # 已注销
    
    # 调用处理函数
    process_subtitle_files(input_srt_file, input_ass_file, output_ass_file)

    # print(f"\n--- 检查 {output_ass_file} 文件内容 (如果创建成功) ---") # 已注销
    # try: # 已注销
    #     with open(output_ass_file, "r", encoding="utf-8-sig") as f:  # 已注销
    #         # print(f"文件 '{output_ass_file}' 的前15行内容：") # 已注销
    #         # for _ in range(15): # 已注销
    #         #     line_content = f.readline() # 已注销
    #         #     if not line_content: # 已注销
    #         #         break # 已注销
    #         #     print(line_content, end='') # 已注销
    #         pass # 无操作，因为print已注销
    # except FileNotFoundError: # 已注销
    #     # print(f"输出文件 {output_ass_file} 未创建或未找到。") # 已注销
    #     pass # 无操作
    # except Exception: # 已注销
    #     # print(f"读取输出文件