import requests
import json
from collections import defaultdict
import os
import glob
import datetime
import tempfile
import re
from pathlib import Path
import base64
###
import update_md
import update_bgm
import update_spotify

if __name__ == '__main__':
    update_md.main()
    update_bgm.main()
    update_spotify.main()