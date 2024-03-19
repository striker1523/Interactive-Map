window.addEventListener('load', () => {

        // Przycisk powrotu do profilu
        const userType = document.getElementById('user-type').value;
        const abutt = document.querySelector('.admin-panel');
        if (userType === '1'){
            abutt.style.display = 'block';
            abutt.addEventListener("click", function() {
                window.location.href = "/profile";
              });
        }

        // Przyciski wyświetlania tabel
        const section = document.querySelector('.admin-section');
        const tabbutts = document.querySelectorAll('.admin-button');
        tabbutts.forEach(butt => {
            butt.addEventListener("click", function(){
                fetchpanel(butt.value);
            });
        })

        function fetchpanel(buttvalue){
            fetch(`/api/admin/${buttvalue}`)
                .then(response => {
                    if (!response.ok) {
                    throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    section.textContent = '';
                    const container = document.createElement('div');
                    container.className = "inputs";
                    const br = document.createElement('br');
                    const br2 = document.createElement('br');
                    let pk = true;
                    for (const key in data[0]) {
                        if (data[0].hasOwnProperty(key)) {
                            if (pk) {
                                pk = false;
                                continue;
                            }
                            const newinput = document.createElement('input');
                            const newlabel = document.createElement('label');
                            newinput.id = `${key}`
                            newinput.placeholder = `${key}`
                            newinput.type = 'text';
                            newlabel.id = `${key}`
                            newlabel.textContent=`${key}: `
                            container.appendChild(newlabel);
                            container.appendChild(newinput);
                            container.appendChild(document.createTextNode('\u00A0'));
                        }
                    }
                    const submitbutt = document.createElement('button')
                    submitbutt.id = `${buttvalue}`;
                    submitbutt.className = 'submit-button';
                    submitbutt.value = "Submit";
                    submitbutt.textContent = "Submit"
                    submitbutt.addEventListener('click', () => {
                        const inputs = document.querySelectorAll('div.inputs input[type="text"]');
                        datapost = {};
                        inputs.forEach(input => {
                            datapost[input.id] = input.value;
                        });
                        console.log(buttvalue);             // Tabela do aktualizacji
                        console.log(datapost);              // Dane do aktualizacji

                        fetch(`/api/admin/${buttvalue}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(datapost),
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Success:', data);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                        setTimeout(function() {
                            fetchpanel(buttvalue);
                        }, 500);
                    })
                    container.appendChild(submitbutt);
                    const modifyHidden = document.createElement('button')
                    modifyHidden.id = 'modify-button';
                    modifyHidden.value = "Modify";
                    modifyHidden.textContent = "Modify"
                    modifyHidden.style.display = 'none';
                    modifyHidden.addEventListener('click', () => {
                        submitbutt.style.display = 'block';
                        modifyHidden.style.display = 'none';

                        const inputs = document.querySelectorAll('div.inputs input[type="text"]');
                        datapost = {};
                        inputs.forEach(input => {
                            datapost[input.id] = input.value;
                        });
                        console.log(buttvalue);             // Tabela do aktualizacji
                        console.log(datapost);              // Dane do aktualizacji
                        console.log(callerID.textContent); // ID do aktualizacji
                        console.log(callerID.className);// jakie id do aktualizacji
                        fetch(`/api/admin/${buttvalue}/${callerID.textContent}/${callerID.className}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(datapost)
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            console.log('Success:', data);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });

                        inputs.forEach((input, index) => {
                            input.value = '';
                        });
                        setTimeout(function() {
                            fetchpanel(buttvalue);
                        }, 500);
                    })
                    container.appendChild(modifyHidden);
                    const cancelHidden = document.createElement('button')
                    cancelHidden.id = 'cancel-button';
                    cancelHidden.value = "Cancel";
                    cancelHidden.textContent = "Cancel"
                    cancelHidden.style.display = 'block';
                    cancelHidden.addEventListener('click', () => {
                        const inputs = document.querySelectorAll('div.inputs input[type="text"]');
                        submitbutt.style.display = 'block';
                        modifyHidden.style.display = 'none';
                        inputs.forEach((input, index) => {
                            input.value = '';
                            fetchpanel(buttvalue)
                        });
                    })
                    container.appendChild(cancelHidden);
                    const callerID = document.createElement('a')
                    callerID.id = 'caller';
                    callerID.textContent = ""
                    callerID.style.display = 'none';
                    container.appendChild(callerID);

                    section.appendChild(container);
                    section.appendChild(br);
                    section.appendChild(br2);

                    data.forEach(e => {
                        const container = document.createElement('div');
                        container.id = `entity${e[Object.keys(e)[0]]}`;
                        const br = document.createElement('br');
                        for (const key in e) {
                            if (e.hasOwnProperty(key)) {
                                const span = document.createElement('span');
                                span.id = `${key}`
                                span.textContent = `${e[key]}`;
                                container.appendChild(span);
                                container.appendChild(document.createTextNode('\u00A0'));
                            }
                        }
                        section.appendChild(container);
                        const modifybutt = document.createElement('button')
                        modifybutt.id = e[Object.keys(e)[0]];
                        modifybutt.value = "Edit";
                        modifybutt.textContent = "Edit"
                        modifybutt.addEventListener("click", () => {
                            const rawdata = document.getElementById(`entity${modifybutt.id}`);
                            const hiddena = document.getElementById(`caller`);
                            const data = rawdata.querySelectorAll('span');
                            const datatab = [];
                            let pk = true;
                            for (const span of data) {
                                if (pk) {
                                    pk = false;
                                    hiddena.className = span.id
                                    continue;
                                }
                                datatab.push(span.innerText);
                            }
                            const inputs = document.querySelectorAll('div.inputs input[type="text"]');
                            submitbutt.style.display = 'none';
                            modifyHidden.style.display = 'block';
                            inputs.forEach((input, index) => {
                                input.value = datatab[index];
                            });
                            hiddena.textContent = modifybutt.id;
                        })
                        const deletebutt = document.createElement('button')
                        deletebutt.id = e[Object.keys(e)[0]];
                        deletebutt.value = "Delete";
                        deletebutt.textContent = "Delete"
                        deletebutt.addEventListener("click", () => {
                            var whatID = document.querySelector(`#entity${deletebutt.id} span:first-child`);
                            console.log(buttvalue);
                            console.log(whatID.id);
                            console.log(deletebutt.id);
                            fetch(`/api/admin/delete/${buttvalue}/${deletebutt.id}/${whatID.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('Success:', data);
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });
                            fetchpanel(buttvalue)
                        })
                        section.appendChild(modifybutt);
                        section.appendChild(deletebutt);
                        section.appendChild(br);
                    });
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        }
});