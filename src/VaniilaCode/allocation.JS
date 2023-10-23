const staff = [
  { name: 'Alex', 		 break: 14, numObservations: 0, 8: '-', security: 3 },
  { name: 'Charl',     break: 14, numObservations: 0, 8: '-' },
  { name: 'Jon', 			 break: 13, numObservations: 0, 8: '-' },
  { name: 'Nigel', 		 break: 15, numObservations: 0, 8: 'BS' },
  { name: 'Fill', 		 break: 15, numObservations: 0, 8: 'Gen' },
  { name: 'Paul', 		 break: 16, numObservations: 0, 8: 'BS' },
  { name: 'Will', 		 break: 16, numObservations: 0, 8: 'HH' },
  { name: 'Pat', 		   break: 18, numObservations: 0, 8: 'HH' },
  { name: 'Nan', 		   break: 19, numObservations: 0, 8: '-' },
  { name: 'Crane', 		 break: 16, numObservations: 0, 8: '-' },
  { name: 'Matt', 		 break: 13, numObservations: 0, 8: 'BW' },
  { name: 'Kane', 		 break: 19, numObservations: 0, 8: 'BW' },
];

const observations = [
	
  { name: 'BW', 	staff: 2 },
  { name: 'HH', 	staff: 2 },
  { name: 'BS', 	staff: 2 },
  { name: 'Gen', 	staff: 1 },
  
];

function allocateObservations (staff, observations) {

const totalObs = observations.reduce((sum, observation) => sum + observation.staff, 0) * 12;
const numStaffMembers = staff.length;
const maxObs = Math.ceil(totalObs / numStaffMembers);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

staff.forEach(staffMember => {
  staffMember.observations = {};
  staffMember.lastObservation = staffMember[8];
  staffMember.obsCounts = {};
  staffMember.lastReceived = {};
	if(staffMember.security !== undefined) {
    staffMember.lastSecurityObservationHour = null; 
  }
  for (let hour = 8; hour <= 19; hour++) {
    staffMember.observations[hour] = hour === 8 ? staffMember[8] : '-';
  }

  if (staffMember[8] !== '-') {
    staffMember.obsCounts[staffMember[8]] = 1;
    staffMember.numObservations = 1;
  } else {
    staffMember.numObservations = 0;
  }
});

const observationAverages = {};

for (let hour = 9; hour <= 19; hour++) { 
  staff.forEach(staffMember => {
    staffMember.lastObservation = staffMember.observations[hour - 1];
  });

  shuffleArray(staff);

  observations.forEach(observation => {
    let assigned = 0;
    let loopCounter = 0;

    while (assigned < observation.staff) {
      loopCounter++;
      if (loopCounter > 1000) {
        console.error('Stuck in loop');
        console.log(`Unable to assign observation: ${observation.name} at hour: ${hour}`);
        break;
      }
/* ---------------  sORTING  ------------------------- */

      // Calculate scores for each staff member
      let staffWithScores = staff.map(staffMember => {
        let score = 0;
        
        score += maxObs - staffMember.numObservations;
       
        if (hour >= 2 && staffMember.observations[hour - 1] !== '-' && staffMember.observations[hour - 2] !== '-') {
          score-=2;
        }
        if (hour >= 3 && staffMember.observations[hour - 1] !== '-' && staffMember.observations[hour - 2] !== '-' && staffMember.observations[hour - 3] !== '-') {
          score-=3;
        }
        if (staffMember.observations[hour - 1] !== '-' && staffMember.observations[hour - 1] !== 'Gen') {
        score -= 100; 
    }
	      if (observation.name === 'Gen') {
          if (hour >= 9 && 
            (staffMember.observations[hour - 1] === 'Gen' || staffMember.observations[hour - 2] === 'Gen')
           ) {
            score -= 4000;
        }}

        for (let k = 1; k <= 2 && hour - k >= 8; k++) {
        if (staffMember.observations[hour - k] === observation.name) {
            score -= 2; 
            break; 
        }
      }
        if (hour === 16 && staffMember.security !== undefined) {
        score -= 3; 
      }

      

        return { ...staffMember, score };
      }
      );
    
      staffWithScores.sort((a, b) => b.score - a.score);




/* ------------------  IF'S ---------------------- */

      for (let i = 0; i < staffWithScores.length; i++) {
    let hasObservationAlready = staffWithScores[i].observations[hour] !== '-';
    let hasSameLastObservation = staffWithScores[i].lastObservation === observation.name;
    let isOnBreak = staffWithScores[i].break === hour;
    let isSecurityHour = (hour === 12 ||hour === 17 || hour === 19) && staffWithScores[i].security !== undefined;
    let reachedMaxObservations = staffWithScores[i].numObservations >= maxObs + 1;
    let reachedSecurityLimit = staffWithScores[i].security !== undefined && staffWithScores[i].numObservations >= staffWithScores[i].security;

    if (!hasObservationAlready && !hasSameLastObservation && !isOnBreak && !isSecurityHour && !reachedSecurityLimit /*&& !reachedMaxObservations*/) {
        let staffMember = staff.find(member => member.name === staffWithScores[i].name);
        staffMember.observations[hour] = observation.name;
        staffMember.numObservations++;
        staffMember.lastObservation = observation.name;

        if(staffMember.security !== undefined) {
            staffMember.lastSecurityObservationHour = hour; 
        }
        if (!staffMember.obsCounts[observation.name]) {
            staffMember.obsCounts[observation.name] = 1;
        } else {
            staffMember.obsCounts[observation.name]++;
        }

        assigned++;
        break;
    }
}
    }
  });
  
  observations.forEach(observation => {
    let totalForObservation = staff.reduce((acc, staffMember) => {
        return acc + (staffMember.obsCounts[observation.name] || 0);
    }, 0);
    observationAverages[observation.name] = totalForObservation / numStaffMembers;
  });
}

  createTable();
}


function createTable() {

staff.forEach(staffMember => {
  staffMember.obsCount = Object.values(staffMember.observations).filter(val => val !== '-').length;
});


let sourceCell = null;

// Handle drag start event
function handleDragStart(e) {
    // Store source cell data
    sourceCell = e.target;
    e.dataTransfer.setData("text/plain", e.target.innerHTML);
}

// Handle drag over event
function handleDragOver(e) {
    // Prevent default to allow drop
    e.preventDefault();
}

// Handle drop event
function handleDrop(e) {
    e.preventDefault();

    let targetCell = e.target;
    if (targetCell.tagName !== 'TD') {
        targetCell = e.target.closest('td'); // Get the closest cell if needed
    }

    // Check if it's a valid target, if it's not the source cell, and if it's a table cell
    if (targetCell && targetCell !== sourceCell && targetCell.tagName === 'TD') {
        // Clear previous highlights
        document.querySelectorAll('.highlight, .sourceHighlight').forEach(cell => {
            cell.classList.remove('highlight', 'sourceHighlight');
        });

        // Swap content
        const originalData = targetCell.innerHTML;
        targetCell.innerHTML = sourceCell.innerHTML;
        sourceCell.innerHTML = originalData;

        // Highlight cells
        sourceCell.classList.add('sourceHighlight');
        targetCell.classList.add('sourceHighlight');
    }
}

// Add event listeners to each cell
function addDragAndDropToCells() {
    const table = document.querySelector('#observations-table');
    table.addEventListener('dragover', handleDragOver, false);
    table.addEventListener('drop', handleDrop, false);

    const cells = table.querySelectorAll('td');
    cells.forEach(cell => {
        cell.setAttribute('draggable', 'true');
        cell.classList.add('draggable');
        cell.addEventListener('dragstart', handleDragStart, false);
    });
}





	staff.sort((a, b) => a.name.localeCompare(b.name));
    
    let table = document.getElementById("observations-table");
    let headerRow = document.getElementById("header-row");
    let tbody = table.getElementsByTagName('tbody')[0];

    // Add table headers
    headerRow.innerHTML = "<th>Time</th>" + staff.map(staffMember => {
        let totalObservations = Object.values(staffMember.observations).filter(val => val !== '-').length;
        return `<th>${staffMember.name} - ${totalObservations}</th>`
    }).join("");

    // Add table rows for each hour
    for (let hour = 8; hour <= 19; hour++) {
        let row = tbody.insertRow();
        row.insertCell().innerText = hour;

        // Add cell for each staff member
        for (let j = 0; j < staff.length; j++) {
            let cell = row.insertCell();
            if(staff[j].break === hour) {
                cell.innerHTML = '<strong>Break</strong>';
            } else {
                cell.innerText = staff[j].observations[hour] || 'Break';
            }
        }
    }
    addDragAndDropToCells();
    
}
