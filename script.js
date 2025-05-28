let currentPage = 'home';
let selectedTrain = null;
let passengerCount = 1;
let bookings = [];

const stationNames = {
    'DEL': 'Delhi',
    'MUM': 'Mumbai',
    'CHE': 'Chennai',
    'KOL': 'Kolkata',
    'BAN': 'Bangalore',
    'HYD': 'Hyderabad'
};

const classNames = {
    'SL': 'Sleeper',
    '3A': 'AC 3 Tier',
    '2A': 'AC 2 Tier',
    '1A': 'AC First Class',
    'CC': 'Chair Car'
};

const trainsData = [
    { name: 'Rajdhani Express', number: '12951', duration: '16h 15m' },
    { name: 'Shatabdi Express', number: '12001', duration: '8h 30m' },
    { name: 'Duronto Express', number: '12213', duration: '14h 45m' },
    { name: 'Garib Rath', number: '12203', duration: '18h 20m' },
    { name: 'Tejas Express', number: '22119', duration: '10h 10m' },
    { name: 'Vande Bharat', number: '22435', duration: '7h 25m' },
    { name: 'Sampark Kranti', number: '12649', duration: '20h 15m' },
    { name: 'Humsafar Express', number: '22913', duration: '15h 40m' },
    { name: 'Jan Shatabdi', number: '12055', duration: '9h 30m' },
    { name: 'Suvidha Express', number: '22663', duration: '12h 45m' }
];

function generateAllTrains() {
    const stations = Object.keys(stationNames);
    const allTrains = [];
    
    for (let i = 0; i < stations.length; i++) {
        for (let j = 0; j < stations.length; j++) {
            if (i === j) continue; // Skip same source and destination
            
            const from = stations[i];
            const to = stations[j];
            
            // Create 3 trains for each route
            for (let k = 0; k < 3; k++) {
                const trainBase = trainsData[k % trainsData.length];
                const hour = 6 + ((i + j + k) % 18); // Departure between 6 AM and 11 PM
                const minute = ((i * 10) + (j * 7) + (k * 13)) % 60;
                
                const departureHour = hour.toString().padStart(2, '0');
                const departureMinute = minute.toString().padStart(2, '0');
                const departure = `${departureHour}:${departureMinute}`;
                
                const durationParts = trainBase.duration.split('h ');
                const durationHours = parseInt(durationParts[0]);
                const durationMinutes = parseInt(durationParts[1].replace('m', ''));
                
                let arrivalHour = (hour + durationHours) % 24;
                let arrivalMinute = (minute + durationMinutes) % 60;
                
                if (arrivalMinute < minute) {
                    arrivalHour = (arrivalHour + 1) % 24;
                }
                
                const arrivalHourStr = arrivalHour.toString().padStart(2, '0');
                const arrivalMinuteStr = arrivalMinute.toString().padStart(2, '0');
                const arrival = `${arrivalHourStr}:${arrivalMinuteStr}`;
                
                const classCodes = ['SL', '3A', '2A', '1A', 'CC'];
                const classes = classCodes.map(code => {
                    const availability = Math.random() > 0.2 ? 
                        `AVAIL${Math.floor(Math.random() * 30) + 1}` : 
                        Math.random() > 0.5 ? 
                            `RAC${Math.floor(Math.random() * 10) + 1}` : 
                            `WL${Math.floor(Math.random() * 20) + 1}`;
                    
                    return {
                        code,
                        name: classNames[code],
                        fare: calculateFare(code, from, to),
                        availability
                    };
                });
                
                const days = generateRunningDays();
                
                const train = {
                    number: trainBase.number + (k + 1).toString().padStart(2, '0'),
                    name: trainBase.name,
                    from,
                    to,
                    departure,
                    arrival,
                    duration: trainBase.duration,
                    classes,
                    days
                };
                
                allTrains.push(train);
            }
        }
    }
    
    return allTrains;
}

function calculateFare(classCode, from, to) {
    const distanceMap = {
        'DEL-MUM': 1400, 'MUM-DEL': 1400,
        'DEL-CHE': 2200, 'CHE-DEL': 2200,
        'DEL-KOL': 1300, 'KOL-DEL': 1300,
        'DEL-BAN': 2100, 'BAN-DEL': 2100,
        'DEL-HYD': 1700, 'HYD-DEL': 1700,
        'MUM-CHE': 1300, 'CHE-MUM': 1300,
        'MUM-KOL': 2000, 'KOL-MUM': 2000,
        'MUM-BAN': 1000, 'BAN-MUM': 1000,
        'MUM-HYD': 800, 'HYD-MUM': 800,
        'CHE-KOL': 1600, 'KOL-CHE': 1600,
        'CHE-BAN': 350, 'BAN-CHE': 350,
        'CHE-HYD': 650, 'HYD-CHE': 650,
        'KOL-BAN': 1900, 'BAN-KOL': 1900,
        'KOL-HYD': 1700, 'HYD-KOL': 1700,
        'BAN-HYD': 600, 'HYD-BAN': 600
    };
    
    const distance = distanceMap[`${from}-${to}`] || 1000;
    
    const classMultiplier = {
        'SL': 0.8,
        '3A': 1.5,
        '2A': 2.2,
        '1A': 3.5,
        'CC': 1.2
    };
    
    return Math.round((distance * classMultiplier[classCode]) / 10) * 10;
}

function generateRunningDays() {
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const daysCount = 1 + Math.floor(Math.random() * 7);
    
    if (daysCount === 7) return ['Daily'];
    
    const selectedDays = [];
    const availableDays = [...allDays];
    
    for (let i = 0; i < daysCount; i++) {
        const index = Math.floor(Math.random() * availableDays.length);
        selectedDays.push(availableDays[index]);
        availableDays.splice(index, 1);
    }
    
    return selectedDays.sort((a, b) => {
        const dayOrder = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
        return dayOrder[a] - dayOrder[b];
    });
}

// Generate all trains at the beginning
const trains = generateAllTrains();

document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('travel-date').valueAsDate = tomorrow;
    
    const savedBookings = localStorage.getItem('trainBookings');
    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    }

    document.getElementById('search-button').addEventListener('click', function(e) {
        e.preventDefault();
        searchTrains();
    });
    
    document.getElementById('add-passenger-button').addEventListener('click', addPassenger);
    document.getElementById('confirm-booking-button').addEventListener('click', confirmBooking);
    document.getElementById('check-pnr-button').addEventListener('click', function(e) {
        e.preventDefault();
        checkPnrStatus();
    });
    
    document.getElementById('back-to-home').addEventListener('click', function() {
        showPage('home');
    });
    
    document.getElementById('pay-now-button').addEventListener('click', function() {
        processPayment();
    });

    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        searchTrains();
    });
    
    document.getElementById('booking-form').addEventListener('submit', function(e) {
        e.preventDefault();
        confirmBooking();
    });
    
    document.getElementById('pnr-form').addEventListener('submit', function(e) {
        e.preventDefault();
        checkPnrStatus();
    });
    
    document.getElementById('payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processPayment();
    });
    
    // Add payment method toggle event
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentFields);
    });
});

function showPage(pageId) {
    const pages = ['home', 'book-ticket', 'ticket', 'pnr-status', 'my-bookings', 'payment'];
    
    pages.forEach(page => {
        document.getElementById(page + '-page').classList.add('hidden');
    });

    document.getElementById(pageId + '-page').classList.remove('hidden');
    currentPage = pageId;

    if (pageId === 'my-bookings') {
        loadBookings();
    }
}

function searchTrains() {
    const fromStation = document.getElementById('from-station').value;
    const toStation = document.getElementById('to-station').value;
    const travelDate = document.getElementById('travel-date').value;
    const travelClass = document.getElementById('class').value;

    if (fromStation === toStation) {
        alert('From and To stations cannot be the same');
        return;
    }

    if (!fromStation || !toStation || !travelDate || !travelClass) {
        alert('Please fill in all fields');
        return;
    }

    // Filter trains for the route and class
    const filteredTrains = trains.filter(train => 
        train.from === fromStation && 
        train.to === toStation &&
        train.classes.some(cls => cls.code === travelClass))
        .map(train => {
            const trainClass = train.classes.find(cls => cls.code === travelClass);
            return {
                ...train,
                selectedClass: trainClass.code,
                className: trainClass.name,
                fare: trainClass.fare,
                availability: trainClass.availability
            };
        });

    displayTrains(filteredTrains, travelClass);
}

function displayTrains(trains, travelClass) {
    const trainsList = document.getElementById('trains-list');
    trainsList.innerHTML = '';

    if (trains.length === 0) {
        trainsList.innerHTML = '<p style="padding: 2rem; text-align: center;">No trains found for your search criteria.</p>';
        document.getElementById('trains-results').classList.remove('hidden');
        return;
    }

    trains.forEach(train => {
        const trainCard = document.createElement('div');
        trainCard.className = 'train-card';
        trainCard.innerHTML = `
            <h3>${train.name} (${train.number})</h3>
            <div class="train-info">
                <div>
                    <p>${stationNames[train.from]} (${train.from})</p>
                    <p>${train.departure}</p>
                </div>
                <div>
                    <p>${stationNames[train.to]} (${train.to})</p>
                    <p>${train.arrival}</p>
                </div>
                <div>
                    <p>Duration</p>
                    <p>${train.duration}</p>
                </div>
                <div>
                    <p>${train.className}</p>
                    <p>₹${train.fare}</p>
                </div>
                <div>
                    <p>Availability</p>
                    <p>${getStatusHTML(train.availability)}</p>
                </div>
            </div>
            <div class="train-actions">
                <button onclick="bookTrain('${train.number}', '${travelClass}')">Book Now</button>
            </div>
        `;
        trainsList.appendChild(trainCard);
    });

    document.getElementById('trains-results').classList.remove('hidden');
}

function getStatusHTML(status) {
    if (status.startsWith('AVAIL')) {
        return `<span class="status-confirmed">${status}</span>`;
    } else if (status.startsWith('RAC')) {
        return `<span class="status-rac">${status}</span>`;
    } else if (status.startsWith('WL')) {
        return `<span class="status-waitlisted">${status}</span>`;
    }
    return status;
}

function bookTrain(trainNumber, travelClass) {
    const train = trains.find(t => t.number === trainNumber);
    if (!train) return;

    const trainClass = train.classes.find(c => c.code === travelClass);
    
    selectedTrain = {
        ...train,
        selectedClass: travelClass,
        className: trainClass.name,
        fare: trainClass.fare,
        availability: trainClass.availability,
        travelDate: document.getElementById('travel-date').value
    };
    
    document.getElementById('train-number').value = selectedTrain.number;
    document.getElementById('train-name').value = selectedTrain.name;
    document.getElementById('from-station-booking').value = stationNames[selectedTrain.from] + ' (' + selectedTrain.from + ')';
    document.getElementById('to-station-booking').value = stationNames[selectedTrain.to] + ' (' + selectedTrain.to + ')';
    document.getElementById('departure-time').value = selectedTrain.departure;
    document.getElementById('arrival-time').value = selectedTrain.arrival;
    document.getElementById('travel-date-booking').value = formatDate(selectedTrain.travelDate);
    document.getElementById('travel-class-booking').value = selectedTrain.className + ' (' + selectedTrain.selectedClass + ')';
    
    resetPassengerForms();
    showPage('book-ticket');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function resetPassengerForms() {
    passengerCount = 1;
    const passengerForms = document.getElementById('passenger-forms');
    passengerForms.innerHTML = `
        <div class="passenger-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="passenger-name-1">Name</label>
                    <input type="text" id="passenger-name-1" required>
                </div>
                <div class="form-group">
                    <label for="passenger-age-1">Age</label>
                    <input type="number" id="passenger-age-1" required min="1" max="120">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="passenger-gender-1">Gender</label>
                    <select id="passenger-gender-1" required>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="passenger-berth-1">Berth Preference</label>
                    <select id="passenger-berth-1">
                        <option value="">No Preference</option>
                        <option value="Lower">Lower</option>
                        <option value="Middle">Middle</option>
                        <option value="Upper">Upper</option>
                        <option value="Side Lower">Side Lower</option>
                        <option value="Side Upper">Side Upper</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

function addPassenger() {
    if (passengerCount >= 6) {
        alert('Maximum 6 passengers allowed per booking');
        return;
    }
    
    passengerCount++;
    const passengerForms = document.getElementById('passenger-forms');
    
    const newPassengerForm = document.createElement('div');
    newPassengerForm.className = 'passenger-form';
    newPassengerForm.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="passenger-name-${passengerCount}">Name</label>
                <input type="text" id="passenger-name-${passengerCount}" required>
            </div>
            <div class="form-group">
                <label for="passenger-age-${passengerCount}">Age</label>
                <input type="number" id="passenger-age-${passengerCount}" required min="1" max="120">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="passenger-gender-${passengerCount}">Gender</label>
                <select id="passenger-gender-${passengerCount}" required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="passenger-berth-${passengerCount}">Berth Preference</label>
                <select id="passenger-berth-${passengerCount}">
                    <option value="">No Preference</option>
                    <option value="Lower">Lower</option>
                    <option value="Middle">Middle</option>
                    <option value="Upper">Upper</option>
                    <option value="Side Lower">Side Lower</option>
                    <option value="Side Upper">Side Upper</option>
                </select>
            </div>
        </div>
    `;
    
    passengerForms.appendChild(newPassengerForm);
}

function confirmBooking() {
    for (let i = 1; i <= passengerCount; i++) {
        const name = document.getElementById(`passenger-name-${i}`).value;
        const age = document.getElementById(`passenger-age-${i}`).value;
        const gender = document.getElementById(`passenger-gender-${i}`).value;
        
        if (!name || !age || !gender) {
            alert('Please fill in all passenger details');
            return;
        }
    }
    
    const totalFare = selectedTrain.fare * passengerCount;
    document.getElementById('payment-amount').textContent = `₹${totalFare}`;
    document.getElementById('payment-train-details').textContent = 
        `${selectedTrain.name} (${selectedTrain.number}) - ${selectedTrain.className}`;
    document.getElementById('payment-journey-details').textContent = 
        `${stationNames[selectedTrain.from]} to ${stationNames[selectedTrain.to]} on ${formatDate(selectedTrain.travelDate)}`;
    document.getElementById('payment-passenger-count').textContent = `${passengerCount} passenger(s)`;
    
    showPage('payment');
}

function togglePaymentFields() {
    const cardFields = document.getElementById('card-fields');
    const upiFields = document.getElementById('upi-fields');
    const netbankingFields = document.getElementById('netbanking-fields');
    const walletFields = document.getElementById('wallet-fields');
    
    cardFields.classList.add('hidden');
    upiFields.classList.add('hidden');
    netbankingFields.classList.add('hidden');
    walletFields.classList.add('hidden');
    
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    if (selectedMethod === 'card') {
        cardFields.classList.remove('hidden');
    } else if (selectedMethod === 'upi') {
        upiFields.classList.remove('hidden');
    } else if (selectedMethod === 'netbanking') {
        netbankingFields.classList.remove('hidden');
    } else if (selectedMethod === 'wallet') {
        walletFields.classList.remove('hidden');
    }
}

function processPayment() {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    
    if (!paymentMethod) {
        alert('Please select a payment method');
        return;
    }
    
    let paymentValid = false;
    
    if (paymentMethod.value === 'card') {
        const cardNumber = document.getElementById('card-number').value;
        const cardName = document.getElementById('card-name').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;
        
        if (cardNumber && cardName && cardExpiry && cardCvv) {
            paymentValid = true;
        } else {
            alert('Please fill in all card details');
        }
    } else if (paymentMethod.value === 'upi') {
        const upi = document.getElementById('upi-id').value;
        if (upi) {
            paymentValid = true;
        } else {
            alert('Please enter your UPI ID');
        }
    } else if (paymentMethod.value === 'netbanking') {
        const netbankingBank = document.getElementById('netbanking-bank').value;
        if (netbankingBank) {
            paymentValid = true;
        } else {
            alert('Please select your bank');
        }
    } else if (paymentMethod.value === 'wallet') {
        const wallet = document.getElementById('wallet-type').value;
        if (wallet) {
            paymentValid = true;
        } else {
            alert('Please select your wallet');
        }
    }
    
    if (!paymentValid) return;
    
    // Generate PNR number (10 digits)
    const pnr = Math.floor(1000000000 + Math.random() * 9000000000);
    
    // Collect passenger details
    const passengers = [];
    for (let i = 1; i <= passengerCount; i++) {
        const name = document.getElementById(`passenger-name-${i}`).value;
        const age = document.getElementById(`passenger-age-${i}`).value;
        const gender = document.getElementById(`passenger-gender-${i}`).value;
        const berth = document.getElementById(`passenger-berth-${i}`).value || 'No Preference';
        
        // Assign seat and status
        const seatNumber = Math.floor(10 + Math.random() * 60);
        let status = 'Confirmed';
        let assignedBerth = berth;
        
        if (selectedTrain.availability.startsWith('WL')) {
            status = 'Waitlisted';
            assignedBerth = 'NA';
        } else if (selectedTrain.availability.startsWith('RAC')) {
            status = 'RAC';
            assignedBerth = 'Side';
        } else if (berth === 'No Preference') {
            const berthTypes = ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
            assignedBerth = berthTypes[Math.floor(Math.random() * berthTypes.length)];
        }
        
        passengers.push({
            name,
            age,
            gender,
            berthPreference: berth,
            assignedBerth,
            seatNumber,
            status
        });
    }
    
    // Create booking object
    const booking = {
        pnr: pnr.toString(),
        train: selectedTrain.number,
        trainName: selectedTrain.name,
        from: selectedTrain.from,
        to: selectedTrain.to,
        departure: selectedTrain.departure,
        arrival: selectedTrain.arrival,
        travelDate: selectedTrain.travelDate,
        travelClass: selectedTrain.selectedClass,
        className: selectedTrain.className,
        fare: selectedTrain.fare * passengerCount,
        passengers,
        bookingDate: new Date().toISOString(),
        status: selectedTrain.availability.startsWith('AVAIL') ? 'Confirmed' : 
                selectedTrain.availability.startsWith('RAC') ? 'RAC' : 'Waitlisted',
        paymentMethod: paymentMethod.value
    };
    
    // Save booking in memory and localStorage
    bookings.push(booking);
    localStorage.setItem('trainBookings', JSON.stringify(bookings));
    
    // Display ticket
    displayTicket(booking);
    
    // Show ticket page
    showPage('ticket');
}

function displayTicket(booking) {
    document.getElementById('ticket-train-name').textContent = `${booking.trainName} (${booking.train})`;
    document.getElementById('ticket-train-route').textContent = `${stationNames[booking.from]} (${booking.from}) to ${stationNames[booking.to]} (${booking.to})`;
    document.getElementById('ticket-pnr').textContent = booking.pnr;
    document.getElementById('ticket-date').textContent = formatDate(booking.travelDate);
    document.getElementById('ticket-departure').textContent = booking.departure;
    document.getElementById('ticket-arrival').textContent = booking.arrival + (booking.arrival < booking.departure ? ' (+1 day)' : '');
    document.getElementById('ticket-class').textContent = `${booking.className} (${booking.travelClass})`;
    document.getElementById('ticket-duration').textContent = selectedTrain.duration;
    
    const passengerList = document.getElementById('passenger-list');
    passengerList.innerHTML = '';
    
    booking.passengers.forEach((passenger, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <b>${index + 1}. ${passenger.name}</b>, ${passenger.age}/${passenger.gender} - 
            Seat: ${passenger.seatNumber}, ${passenger.assignedBerth} - 
            <span class="status-${passenger.status.toLowerCase()}">${passenger.status}</span>
        `;
        passengerList.appendChild(li);
    });
    
    document.getElementById('ticket-status').textContent = booking.status;
    document.getElementById('ticket-status').className = `status-${booking.status.toLowerCase()}`;
}

function checkPnrStatus() {
    const pnrNumber = document.getElementById('pnr-number').value;
    
    if (!pnrNumber || pnrNumber.length !== 10 || !/^\d+$/.test(pnrNumber)) {
        alert('Please enter a valid 10-digit PNR number');
        return;
    }
    
    const booking = bookings.find(b => b.pnr === pnrNumber);
    
    const pnrResult = document.getElementById('pnr-result');
    
    if (!booking) {
        pnrResult.innerHTML = '<p style="padding: 2rem; text-align: center;">No booking found with this PNR number.</p>';
        pnrResult.classList.remove('hidden');
        return;
    }
    
    pnrResult.innerHTML = `
        <div class="ticket">
            <div class="ticket-header">
                <div>
                    <h3>${booking.trainName} (${booking.train})</h3>
                    <p>${stationNames[booking.from]} (${booking.from}) to ${stationNames[booking.to]} (${booking.to})</p>
                </div>
                <div>
                    <p><span>PNR:</span> <span>${booking.pnr}</span></p>
                    <p><span>Date:</span> <span>${formatDate(booking.travelDate)}</span></p>
                </div>
            </div>
            <div class="ticket-body">
                <div class="ticket-info">
                    <p><span>Departure:</span> <span>${booking.departure}</span></p>
                    <p><span>Arrival:</span> <span>${booking.arrival}${booking.arrival < booking.departure ? ' (+1 day)' : ''}</span></p>
                    <p><span>Class:</span> <span>${booking.className} (${booking.travelClass})</span></p>
                    <div>
                        <p><span>Passengers:</span></p>
                        <ul>
                            ${booking.passengers.map((passenger, index) => 
                                `<li>
                                    <b>${index + 1}. ${passenger.name}</b>, ${passenger.age}/${passenger.gender} - 
                                    Seat: ${passenger.seatNumber}, ${passenger.assignedBerth} - 
                                    <span class="status-${passenger.status.toLowerCase()}">${passenger.status}</span>
                                </li>`
                            ).join('')}
                        </ul>
                    </div>
                    <p><span>Status:</span> <span class="status-${booking.status.toLowerCase()}">${booking.status}</span></p>
                </div>
            </div>
        </div>
    `;
    
    pnrResult.classList.remove('hidden');
}

function loadBookings() {
    const bookingsList = document.getElementById('bookings-list');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p style="padding: 2rem; text-align: center;">No bookings found.</p>';
        return;
    }
    
    bookingsList.innerHTML = '';
    
    bookings.forEach(booking => {
        const bookingCard = document.createElement('div');
        bookingCard.className = 'booking-card';
    bookingCard.innerHTML = `
        <div class="train-card">
            <h3>${booking.trainName} (${booking.train})</h3>
            <div class="train-info">
                <div>
                    <p>${stationNames[booking.from]} (${booking.from}) to ${stationNames[booking.to]} (${booking.to})</p>
                    <p>Date: ${formatDate(booking.travelDate)}</p>
                </div>
                <div>
                    <p>PNR: ${booking.pnr}</p>
                    <p>Class: ${booking.className} (${booking.travelClass})</p>
                </div>
                <div>
                    <p>Passengers: ${booking.passengers.length}</p>
                    <p>Status: <span class="status-${booking.status.toLowerCase()}">${booking.status}</span></p>
                </div>
            </div>
            <div class="train-actions">
                <button onclick="viewBooking('${booking.pnr}')">View Details</button>
            </div>
        </div>
    `;
    bookingsList.appendChild(bookingCard);
});
}

function viewBooking(pnr) {
    const booking = bookings.find(b => b.pnr === pnr);
    if (booking) {
        displayTicket(booking);
        showPage('ticket');
    }
}

// Add this to window scope so the buttons can access these functions
window.bookTrain = bookTrain;
window.viewBooking = viewBooking;

// Payment gateway UI management
function processPayment() {
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    
    if (!paymentMethod) {
        alert('Please select a payment method');
        return;
    }
    
    let paymentValid = false;
    
    if (paymentMethod.value === 'card') {
        const cardNumber = document.getElementById('card-number').value;
        const cardName = document.getElementById('card-name').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;
        
        if (cardNumber && cardName && cardExpiry && cardCvv) {
            paymentValid = true;
        } else {
            alert('Please fill in all card details');
        }
    } else if (paymentMethod.value === 'upi') {
        const upi = document.getElementById('upi-id').value;
        if (upi) {
            paymentValid = true;
        } else {
            alert('Please enter your UPI ID');
        }
    } else if (paymentMethod.value === 'netbanking') {
        const netbankingBank = document.getElementById('netbanking-bank').value;
        if (netbankingBank) {
            paymentValid = true;
        } else {
            alert('Please select your bank');
        }
    } else if (paymentMethod.value === 'wallet') {
        const wallet = document.getElementById('wallet-type').value;
        if (wallet) {
            paymentValid = true;
        } else {
            alert('Please select your wallet');
        }
    }
    
    if (!paymentValid) return;
    
    // Generate PNR number (10 digits)
    const pnr = Math.floor(1000000000 + Math.random() * 9000000000);
    
    // Collect passenger details
    const passengers = [];
    for (let i = 1; i <= passengerCount; i++) {
        const name = document.getElementById(`passenger-name-${i}`).value;
        const age = document.getElementById(`passenger-age-${i}`).value;
        const gender = document.getElementById(`passenger-gender-${i}`).value;
        const berth = document.getElementById(`passenger-berth-${i}`).value || 'No Preference';
        
        // Assign seat and status
        const seatNumber = Math.floor(10 + Math.random() * 60);
        let status = 'Confirmed';
        let assignedBerth = berth;
        
        if (selectedTrain.availability.startsWith('WL')) {
            status = 'Waitlisted';
            assignedBerth = 'NA';
        } else if (selectedTrain.availability.startsWith('RAC')) {
            status = 'RAC';
            assignedBerth = 'Side';
        } else if (berth === 'No Preference') {
            const berthTypes = ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
            assignedBerth = berthTypes[Math.floor(Math.random() * berthTypes.length)];
        }
        
        passengers.push({
            name,
            age,
            gender,
            berthPreference: berth,
            assignedBerth,
            seatNumber,
            status
        });
    }
    
    // Create booking object
    const booking = {
        pnr: pnr.toString(),
        train: selectedTrain.number,
        trainName: selectedTrain.name,
        from: selectedTrain.from,
        to: selectedTrain.to,
        departure: selectedTrain.departure,
        arrival: selectedTrain.arrival,
        travelDate: selectedTrain.travelDate,
        travelClass: selectedTrain.selectedClass,
        className: selectedTrain.className,
        fare: selectedTrain.fare * passengerCount,
        passengers,
        bookingDate: new Date().toISOString(),
        status: selectedTrain.availability.startsWith('AVAIL') ? 'Confirmed' : 
                selectedTrain.availability.startsWith('RAC') ? 'RAC' : 'Waitlisted',
        paymentMethod: paymentMethod.value
    };
    
    // Save booking in memory and localStorage
    bookings.push(booking);
    localStorage.setItem('trainBookings', JSON.stringify(bookings));
    
    // Display ticket
    displayTicket(booking);
    
    // Show ticket page
    showPage('ticket');
}

// Fix for train search to ensure trains are available for all station combinations
function generateAllTrains() {
    const stations = Object.keys(stationNames);
    const allTrains = [];
    
    for (let i = 0; i < stations.length; i++) {
        for (let j = 0; j < stations.length; j++) {
            if (i === j) continue; // Skip same source and destination
            
            const from = stations[i];
            const to = stations[j];
            
            // Create 3 trains for each route
            for (let k = 0; k < 3; k++) {
                const trainBase = trainsData[Math.floor(Math.random() * trainsData.length)];
                const hour = 6 + ((i + j + k) % 18); // Departure between 6 AM and 11 PM
                const minute = ((i * 10) + (j * 7) + (k * 13)) % 60;
                
                const departureHour = hour.toString().padStart(2, '0');
                const departureMinute = minute.toString().padStart(2, '0');
                const departure = `${departureHour}:${departureMinute}`;
                
                const durationParts = trainBase.duration.split('h ');
                const durationHours = parseInt(durationParts[0]);
                const durationMinutes = parseInt(durationParts[1].replace('m', ''));
                
                let arrivalHour = (hour + durationHours) % 24;
                let arrivalMinute = (minute + durationMinutes) % 60;
                
                if (arrivalMinute < minute) {
                    arrivalHour = (arrivalHour + 1) % 24;
                }
                
                const arrivalHourStr = arrivalHour.toString().padStart(2, '0');
                const arrivalMinuteStr = arrivalMinute.toString().padStart(2, '0');
                const arrival = `${arrivalHourStr}:${arrivalMinuteStr}`;
                
                const classCodes = ['SL', '3A', '2A', '1A', 'CC'];
                const classes = classCodes.map(code => {
                    const availability = Math.random() > 0.2 ? 
                        `AVAIL${Math.floor(Math.random() * 30) + 1}` : 
                        Math.random() > 0.5 ? 
                            `RAC${Math.floor(Math.random() * 10) + 1}` : 
                            `WL${Math.floor(Math.random() * 20) + 1}`;
                    
                    return {
                        code,
                        name: classNames[code],
                        fare: calculateFare(code, from, to),
                        availability
                    };
                });
                
                const days = generateRunningDays();
                
                const train = {
                    number: `${trainBase.number}${from}${to}${k+1}`.substring(0, 10),
                    name: trainBase.name,
                    from,
                    to,
                    departure,
                    arrival,
                    duration: trainBase.duration,
                    classes,
                    days
                };
                
                allTrains.push(train);
            }
        }
    }
    
    return allTrains;
}

// Update the searchTrains function to always find trains
function searchTrains() {
    const fromStation = document.getElementById('from-station').value;
    const toStation = document.getElementById('to-station').value;
    const travelDate = document.getElementById('travel-date').value;
    const travelClass = document.getElementById('class').value;

    if (fromStation === toStation) {
        alert('From and To stations cannot be the same');
        return;
    }

    if (!fromStation || !toStation || !travelDate || !travelClass) {
        alert('Please fill in all fields');
        return;
    }

    // Find trains for this route specifically
    let filteredTrains = trains.filter(train => 
        train.from === fromStation && 
        train.to === toStation && 
        train.classes.some(cls => cls.code === travelClass));
    
    // If no trains found, generate some specifically for this route
    if (filteredTrains.length === 0) {
        const additionalTrains = generateTrainsForRoute(fromStation, toStation, travelClass);
        trains.push(...additionalTrains);
        filteredTrains = additionalTrains;
    }
    
    const trainsWithClassInfo = filteredTrains.map(train => {
        const trainClass = train.classes.find(cls => cls.code === travelClass);
        return {
            ...train,
            selectedClass: trainClass.code,
            className: trainClass.name,
            fare: trainClass.fare,
            availability: trainClass.availability
        };
    });

    displayTrains(trainsWithClassInfo, travelClass);
}

// Function to generate trains for a specific route if none exist
function generateTrainsForRoute(from, to, travelClass) {
    const additionalTrains = [];
    
    // Generate 5 trains for this specific route
    for (let i = 0; i < 5; i++) {
        const trainBase = trainsData[i % trainsData.length];
        const hour = 6 + (i * 3) % 18; // Spread departures throughout the day
        const minute = (i * 13) % 60;
        
        const departureHour = hour.toString().padStart(2, '0');
        const departureMinute = minute.toString().padStart(2, '0');
        const departure = `${departureHour}:${departureMinute}`;
        
        const durationParts = trainBase.duration.split('h ');
        const durationHours = parseInt(durationParts[0]);
        const durationMinutes = parseInt(durationParts[1].replace('m', ''));
        
        let arrivalHour = (hour + durationHours) % 24;
        let arrivalMinute = (minute + durationMinutes) % 60;
        
        if (arrivalMinute < minute) {
            arrivalHour = (arrivalHour + 1) % 24;
        }
        
        const arrivalHourStr = arrivalHour.toString().padStart(2, '0');
        const arrivalMinuteStr = arrivalMinute.toString().padStart(2, '0');
        const arrival = `${arrivalHourStr}:${arrivalMinuteStr}`;
        
        const classCodes = ['SL', '3A', '2A', '1A', 'CC'];
        const classes = classCodes.map(code => {
            // Make sure there's high availability
            const availability = `AVAIL${Math.floor(Math.random() * 30) + 10}`;
            
            return {
                code,
                name: classNames[code],
                fare: calculateFare(code, from, to),
                availability
            };
        });
        
        const days = ['Daily']; // These trains run daily
        
        // Custom names for additional trains
        const specialTrainNames = [
            `${stationNames[from]}-${stationNames[to]} Express`, 
            `${stationNames[from]} ${stationNames[to]} Superfast`,
            `${stationNames[from].substr(0,3)}-${stationNames[to].substr(0,3)} Special`,
            `${stationNames[from]} ${stationNames[to]} Link`,
            `${stationNames[from]}-${stationNames[to]} Passenger`
        ];
        
        const train = {
            number: `${trainBase.number}${from}${to}${i+1}`.substring(0, 10),
            name: specialTrainNames[i],
            from,
            to,
            departure,
            arrival,
            duration: trainBase.duration,
            classes,
            days
        };
        
        additionalTrains.push(train);
    }
    
    return additionalTrains;
}

// Initialize the payment pagedocument.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('DOMContentLoaded', function() {
        const paymentPage = document.getElementById('payment-page');
        if (!paymentPage) {
            const container = document.querySelector('.container');
            
            const paymentPageHTML = `
                <div id="payment-page" class="hidden">
                    <div class="payment-form">
                        <h2>Payment</h2>
                        <div class="booking-summary">
                            <h3>Booking Summary</h3>
                            <p><strong>Train:</strong> <span id="payment-train-details"></span></p>
                            <p><strong>Journey:</strong> <span id="payment-journey-details"></span></p>
                            <p><strong>Passengers:</strong> <span id="payment-passenger-count"></span></p>
                            <p class="total-amount"><strong>Total Amount:</strong> <span id="payment-amount"></span></p>
                        </div>
                        
                        <form id="payment-form">
                            <h3>Select Payment Method</h3>
                            <div class="payment-methods">
                                <div class="payment-method">
                                    <input type="radio" id="card-payment" name="payment-method" value="card">
                                    <label for="card-payment">Credit/Debit Card</label>
                                </div>
                                <div class="payment-method">
                                    <input type="radio" id="upi-payment" name="payment-method" value="upi">
                                    <label for="upi-payment">UPI</label>
                                </div>
                                <div class="payment-method">
                                    <input type="radio" id="netbanking-payment" name="payment-method" value="netbanking">
                                    <label for="netbanking-payment">Net Banking</label>
                                </div>
                                <div class="payment-method">
                                    <input type="radio" id="wallet-payment" name="payment-method" value="wallet">
                                    <label for="wallet-payment">Wallet</label>
                                </div>
                            </div>
                            
                            <div id="card-fields" class="payment-fields hidden">
                                <div class="form-group">
                                    <label for="card-number">Card Number</label>
                                    <input type="text" id="card-number" placeholder="1234 5678 9012 3456">
                                </div>
                                <div class="form-group">
                                    <label for="card-name">Name on Card</label>
                                    <input type="text" id="card-name">
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="card-expiry">Expiry (MM/YY)</label>
                                        <input type="text" id="card-expiry" placeholder="MM/YY">
                                    </div>
                                    <div class="form-group">
                                        <label for="card-cvv">CVV</label>
                                        <input type="password" id="card-cvv" maxlength="3">
                                    </div>
                                </div>
                            </div>
                            
                            <div id="upi-fields" class="payment-fields hidden">
                                <div class="form-group">
                                    <label for="upi-id">UPI ID</label>
                                    <input type="text" id="upi-id" placeholder="username@upi">
                                </div>
                            </div>
                            
                            <div id="netbanking-fields" class="payment-fields hidden">
                                <div class="form-group">
                                    <label for="netbanking-bank">Select Bank</label>
                                    <select id="netbanking-bank">
                                        <option value="">Select Bank</option>
                                        <option value="sbi">State Bank of India</option>
                                        <option value="hdfc">HDFC Bank</option>
                                        <option value="icici">ICICI Bank</option>
                                        <option value="axis">Axis Bank</option>
                                        <option value="pnb">Punjab National Bank</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div id="wallet-fields" class="payment-fields hidden">
                                <div class="form-group">
                                    <label for="wallet-type">Select Wallet</label>
                                    <select id="wallet-type">
                                        <option value="">Select Wallet</option>
                                        <option value="paytm">Paytm</option>
                                        <option value="phonepe">PhonePe</option>
                                        <option value="gpay">Google Pay</option>
                                        <option value="amazonpay">Amazon Pay</option>
                                        <option value="freecharge">Freecharge</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button type="button" id="pay-now-button">Pay Now</button>
                        </form>
                    </div>
                </div>
            `;
    
            container.insertAdjacentHTML('beforeend', paymentPageHTML);
    
            // Add event listeners for payment method toggling
            document.querySelectorAll('input[name="payment-method"]').forEach(method => {
                method.addEventListener('change', togglePaymentFields);
            });
    
            // Add event listener for the pay now button
            document.getElementById('pay-now-button').addEventListener('click', function() {
                // Simulate payment processing
                this.innerHTML = 'Processing...';
                this.disabled = true;
                
                // Simulate a payment process delay
                setTimeout(function() {
                    // Hide payment page
                    document.getElementById('payment-page').classList.add('hidden');
                    
                    // Show payment success notification
                    document.getElementById('payment-success').classList.remove('hidden');
                    
                    // Generate a random PNR number
                    const pnr = Math.floor(1000000000 + Math.random() * 9000000000);
                    document.getElementById('success-pnr').textContent = pnr;
                    document.getElementById('ticket-pnr').textContent = pnr;
                }, 2000);
            });
            
            // Add event listener for the view ticket button
            document.getElementById('view-ticket-button').addEventListener('click', function() {
                // Hide payment success notification
                document.getElementById('payment-success').classList.add('hidden');
                
                // Show ticket page
                document.getElementById('ticket-page').classList.remove('hidden');
            });
        }
    });

// Add CSS for payment page
document.addEventListener('DOMContentLoaded', function() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .payment-form {
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .booking-summary {
            background-color: #f9f9f9;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }
        
        .booking-summary h3 {
            color: #2E5E43;
            margin-bottom: 0.5rem;
        }
        
        .total-amount {
            font-size: 1.2rem;
            margin-top: 0.5rem;
        }
        
        .payment-methods {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .payment-method {
            flex: 1;
            min-width: 120px;
            background-color: #f9f9f9;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .payment-method:hover {
            background-color: #eee;
        }
        
        .payment-method input {
            margin-right: 0.5rem;
        }
        
        .payment-fields {
            margin-bottom: 1.5rem;
        }
    `;
    document.head.appendChild(styleElement);
});

// Fix the typo in the CSS class for confirmed status
document.addEventListener('DOMContentLoaded', function() {
    const styleSheet = document.styleSheets[0];
    let found = false;
    
    // Look for the rule with the typo
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
        const rule = styleSheet.cssRules[i];
        if (rule.selectorText === '.status -confirmed') {
            // Remove the rule with typo
            styleSheet.deleteRule(i);
            
            // Add correct rule
            styleSheet.insertRule('.status-confirmed { color: #1E90FF !important; }', i);
            found = true;
            break;
        }
    }
    
    // If not found, add it
    if (!found) {
        styleSheet.insertRule('.status-confirmed { color: #1E90FF !important; }', styleSheet.cssRules.length);
    }
});