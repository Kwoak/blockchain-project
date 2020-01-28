import sys

data = open("belAmi.txt","r")
tbl = data.read().split('\n')

def triPage(r):
    inputPage = int(sys.argv[2])+5
    debP = "{\n\t\"pageNumber\":["
    debT = "],\n\t\"texte\":[\""
    fin = "\"]\n}"
    nRow = r+1
    i = 0
    i2 = 0
    i3=0
    for row2 in tbl[nRow:len(tbl)]:
        i3+=1
        if '||' in row2:
            i += 1
            numPage = i + int(sys.argv[2])
            debP += str(numPage)
            if i < 5 :
                debP += ', '
                debT += '\", \"'
        else :
            i2 += 1
            debT += row2
            if i2 - i == 2 :
                i2 -= 1
                debT += '  '
            print(debT+" "+str(i3))
        if row2 == str(inputPage)+'||':
            new = open(sys.argv[1], 'w')
            new.write(debP+debT+fin)
            exit(2)

nCar = -1
for row in tbl:
    nCar += 1
    inputPage = int(sys.argv[2])+5
    if row == sys.argv[2] + '||':
        triPage(tbl.index(row))
    elif sys.argv[2] == "0":
        triPage(-1)

