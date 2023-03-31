import librosa
import numpy as np

# 加载音频文件
audio_file = '../media/daybreak frontline.mp3'
y, sr = librosa.load(audio_file)

# 提取音频特征
tempo, beats = librosa.beat.beat_track(y=y, sr=sr)

# 将帧编号转换为时间轴上的时间
times = librosa.frames_to_time(beats, sr=sr)

# 保存节拍时间信息到文本文件
np.savetxt('beat_times.txt', times, fmt='%.8f')

# 输出节拍数量和时间范围
print('Number of beats:', len(beats))
print('Time range:', times[-1] - times[0])
