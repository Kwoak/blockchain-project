with open('trap.txt', 'r') as file:
    data = file.read().replace('  ', '\n\n')
    data = data.replace('', '\n\n')
    new = open('trap2.txt','w')
    new.write(data)

