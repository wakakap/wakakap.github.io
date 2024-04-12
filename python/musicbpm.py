import madmom
# 只能在python3.7版本运行，3.10会报错。搭建虚拟环境受阻，在环境变量中直接改为3.7的pip pyhon路径即可。该路径后要重启vscode或者cmd才生效。



# 加载音频文件
input_file = '../media/daybreak_frontline_sundary.mp3'

# 定义输入文件路径和输出文件路径
output_file = 'file.txt'

# 使用madmom库计算bpm节拍时间序列
proc = madmom.features.beats.RNNBeatProcessor()
act = madmom.features.beats.RNNBeatProcessor()(input_file)
beats = madmom.features.beats.DBNBeatTrackingProcessor(fps=80)(act)

# 将bpm节拍时间序列写入txt文件中
with open(output_file, 'w') as f:
    for beat in beats:
        f.write(str(beat) + '\n')
