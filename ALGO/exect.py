import os
import sys

os.system('cd C:\Users\user\Documents\48h\blockchain-project\ALGO')
os.system('python.exe parsingPdf.py -s "48PDF.pdf" -f "belAmi.txt"')
os.system('python.exe getFilePage.py '+sys.argv[1])