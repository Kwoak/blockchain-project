import sys

data = open("belAmi.txt","r")
tbl = data.read().split('\n')

maxPage = 0
for row in tbl:
    if '||' in row:
        maxPage += 1

def triPage(r):
    inputPage = int(sys.argv[1])+5
    debP = "{\n\t\"pageNumber\":["
    debT = "],\n\t\"texte\":[\""
    fin = "\"]\n}"
    numPage = 0
    nRow = r+1
    i = 0
    i2 = 0
    for row2 in tbl[nRow:len(tbl)]:
        if '||' in row2:
            i += 1
            numPage = i + int(sys.argv[1])
            debP += str(numPage)
            if i < 5 and numPage != maxPage:
                debP += ', '
                debT += '\", \"'
        else :
            i2 += 1
            debT += row2
            if i2 - i == 2 :
                i2 -= 1
                debT += '  '
        if row2 == str(inputPage)+'||' or numPage == maxPage:
            return debP + debT + fin



nCar = -1
res = ""
for row in tbl:
    nCar += 1
    inputPage = int(sys.argv[1])+5
    if row == sys.argv[1] + '||':
        res = triPage(tbl.index(row))
    elif sys.argv[1] == "0":
        res = triPage(-1)
print(res)

