const staff = [
  { name: 'Alex', 		 break: 14, numObservations: 0, 8: '-', security: 5 },
  { name: 'Charl',     break: 14, numObservations: 0, 8: '-' },
  { name: 'Jon', 			 break: 13, numObservations: 0, 8: '-' },
  { name: 'Nigel', 		 break: 15, numObservations: 0, 8: 'AP' },
  { name: 'Fill', 		 break: 15, numObservations: 0, 8: 'Gen' },
  { name: 'Paul', 		 break: 16, numObservations: 0, 8: 'AP' },
  { name: 'Will', 		 break: 16, numObservations: 0, 8: 'AY' },
  { name: 'Pat', 		   break: 18, numObservations: 0, 8: 'AY' },
  { name: 'Nan', 		   break: 19, numObservations: 0, 8: '-' },
  { name: 'Crane', 		 break: 19, numObservations: 0, 8: '-' },
];

const observations = [
	
  //{ name: 'BW', 	staff: 3 },
  { name: 'AY', 	staff: 2 },
  { name: 'AP', 	staff: 2 },
  { name: 'Gen', 	staff: 1 },
  
];

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
      if (loopCounter > 2000) {
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

        // This is where the block of code goes:
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

console.log(maxObs, totalObs)
staff.forEach(staffMember => {
  staffMember.obsCount = Object.values(staffMember.observations).filter(val => val !== '-').length;
});

console.log('Name\t8\t9\t10\t11\t12\t13\t14\t15\t16\t17\t18\t19\tTotal True');
let totalObservations = 0;
staff.forEach(staffMember => {
  let line = staffMember.name;
  for (let hour = 8; hour <= 19; hour++) {
    line += staffMember.break === hour ? '\t!!' : '\t' + staffMember.observations[hour];
  }
  line += '\t' + staffMember.numObservations;
  line += '\t  ' + staffMember.obsCount;
  console.log(line);
  totalObservations += staffMember.obsCount;
});
console.log('Total Observations Across All Staff: ' + totalObservations);



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
    // Swap innerHTML of source cell and target cell
    e.preventDefault();

    if(e.target === sourceCell){
    	return;
    }

    document.querySelectorAll('.highlight, .sourceHighlight').forEach(cell => {
        cell.classList.remove('highlight');
        cell.classList.remove('sourceHighlight');
    });

    const originalData = e.target.innerHTML;
    e.target.innerHTML = sourceCell.innerHTML;
    sourceCell.innerHTML = originalData;
    sourceCell.classList.add('sourceHighlight');
    e.target.classList.add('highlight');
   
}

// Add event listeners to each cell
function addDragAndDropToCells() {
    const rows = document.querySelectorAll('#observations-table tr');
    rows.forEach(row => {
        let cells = row.querySelectorAll('td');
        // start from 1 to avoid the first cell
        for(let i = 1; i < cells.length; i++) {
            cells[i].setAttribute('draggable', 'true');
            cells[i].addEventListener('dragstart', handleDragStart, false);
            cells[i].addEventListener('dragover', handleDragOver, false);
            cells[i].addEventListener('drop', handleDrop, false);
        }
    });
}



window.onload = function() {

	staff.sort((a, b) => a.name.localeCompare(b.name));
    // Assuming staff and observations are defined somewhere in this script
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
