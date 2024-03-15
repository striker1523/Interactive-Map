const names = ['religion', 'type', 'era', 'prefecture'];

names.forEach(element => {
    fetch(`api/distinct/${element}/objects/${element}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Request failed');
        }
        return response.json();
    })
    .then(data => {
        const list = document.getElementById(`filters-${element}-ul`);
        data.forEach(e => {
            const listItem = document.createElement('li');
            const checkbox = document.createElement('input');
            const checkmarkSpan = document.createElement('span');
            checkbox.type = 'checkbox';
            checkbox.id = e[element];
            checkbox.className = element;
            checkmarkSpan.className = 'checkmark';
            const label = document.createElement('label');
            label.textContent = `${e[element]}`;
            label.setAttribute('for', e[element]);
            listItem.appendChild(checkbox);
            listItem.appendChild(label);
            listItem.appendChild(checkmarkSpan);
            
            list.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error(error);
    });
});

fetch(`api/distinct/name/deities/name`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => {
    if (!response.ok) {
        throw new Error('Request failed');
    }
    return response.json();
})
.then(data => {
    const list = document.getElementById(`filters-deity-ul`);
    data.forEach((e, i) => {
        deity_name = e.name;
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        const checkmarkSpan = document.createElement('span');
        checkbox.type = 'checkbox';
        checkbox.id = deity_name;
        checkbox.className = 'deity';
        checkmarkSpan.className = 'checkmark';
        const label = document.createElement('label');
        label.textContent = `${deity_name}`;
        label.setAttribute('for', deity_name);
        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        listItem.appendChild(checkmarkSpan);
        
        list.appendChild(listItem);
    });
})
.catch(error => {
    console.error(error);
});
