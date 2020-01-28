import sys

data = open("trap.txt","r")
tbl = data.read().split('\n')

def triPage1(r):
    inputPage = int(sys.argv[2])+5
    print("Trouve !!!")
    nRow = r+1
    new = open(sys.argv[1],'w')
    for row2 in tbl[nRow:len(tbl)]:
        new.write(row2+"\n")
        if row2 == str(inputPage)+'||':
            exit(2)

def triPage(r):
    inputPage = int(sys.argv[2])+5
    debP = "{\n\t\"pageNumber\":["
    debT = "],\n\t\"texte\":[\""
    fin = "\"]\n}"
    nRow = r+1
    i = 0
    i2 = 0
    bool = False
    for row2 in tbl[nRow:len(tbl)]:
        print(row2+"\n")
        if bool == False:
            bool = True
            i2 += 1
            debT += row2
            if i2 - i == 2 :
                i2 -= 1
                debT += '  '
        elif '||' in row2:
            bool = False
            i += 1
            numPage = i + int(sys.argv[2])
            debP += str(numPage)
            if i < 5 :
                debP += ', '
                debT += '\", \"'
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
        triPage(0)

