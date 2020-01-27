import sys

with open(sys.argv[1], 'r') as f:
    data = f.read().replace('  ', '\n\n')
    data = data.replace('\n ', '\n\n')
    data = data.replace('', '||')
print(type(sys.argv[2]))
print(data[1])

tbl = data.split('\n')
print(tbl[37:41])

def triPage(r):
    print("Trouve !!!")
    nRow = r+1
    print(nRow)
    new = open(sys.argv[2],'w')
    for row2 in tbl[nRow:len(tbl)]:
        new.write(row2+"\n")
        if row2 == str(inputPage)+'||':
            exit(2)

nCar = -1
for row in tbl:
    nCar += 1
    inputPage = int(sys.argv[3])+5
    if row == sys.argv[3] + '||':
        triPage(tbl.index(row))
    elif sys.argv[3] == "0":
        triPage(0)


