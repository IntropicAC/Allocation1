const staff = [
  { name: 'Alex', 	break: 14, numObservations: 0, 8: 'BW' },
  { name: 'Adam', 	break: 14, numObservations: 0, 8: 'BW' },
  { name: 'Mark', 	break: 15, numObservations: 0, 8: 'BW' },
  { name: 'Jane', 	break: 15, numObservations: 0, 8: 'CA' },
  { name: 'Peter', 	break: 16, numObservations: 0, 8: 'CA' },
  { name: 'Angila', break: 16, numObservations: 0, 8: '-' },
  { name: 'Paul', 	break: 17, numObservations: 0, 8: 'Gen' },
  { name: 'Char', 	break: 17, numObservations: 0, 8: '-', security: 5 },
  { name: 'Dan', 		break: 18, numObservations: 0, 8: '-' },
  { name: 'Ralph', 	break: 19, numObservations: 0, 8: '-' },
];

const observations = [
  { name: 'BW', 	staff: 3 },
  { name: 'CA', 	staff: 2 },
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
      if (loopCounter > 10000) {
        console.error('Stuck in loop');
        console.log(`Unable to assign observation: ${observation.name} at hour: ${hour}`);
        break;
      }

      // Calculate scores for each staff member
      let staffWithScores = staff.map(staffMember => {
        let score = 0;
        if (staffMember.observations[hour - 1] !== observation.name) {
          score++;
        }
        score += maxObs - staffMember.numObservations;
        
        if (staffMember.observations[hour - 1] === '-') {
          score+=2;
        }
        if (hour >= 2 && staffMember.observations[hour - 1] !== '-' && staffMember.observations[hour - 					2] !== '-') {
          score-=10;
        }
        if (hour >= 2 && staffMember.observations[hour - 1] !== '-' && staffMember.observations[hour -2] !== '-' && staffMember.observations[hour - 3] !== '-') {
          score-=20;
        }
        if (staffMember.observations[hour - 1] === '-' && observation.name === "Gen") {
          score -=2;  // This value can be tweaked as needed
        }
        if (staffMember.obsCounts[observation.name] > 1) {
          score-=10;
        }
        if (staffMember.obsCounts[observation.name] > 2) { 
          score-=20;
        }
        if (staffMember.obsCounts[observation.name] > 3) { 
          score-=40;
        }
        if (staffMember.obsCounts[observation.name] > 4) { 
          score-=80;
        }
        // This section checks for the condition if the staff member has received 2 observations in the past hour that are not Gen
        if (hour >= 2 && observation.name === "Gen" && staffMember.observations[hour - 1] !== 'Gen' && staffMember.observations[hour - 2] !== 'Gen') {
          score += 10; // Increase the score
        }
        return { ...staffMember, score };
      });

      staffWithScores.sort((a, b) => b.score - a.score);

      for (let i = 0; i < staffWithScores.length; i++) {
        let hasObservationAlready = staffWithScores[i].observations[hour] !== '-';
        let hasSameLastObservation = staffWithScores[i].lastObservation === observation.name;
        let isOnBreak = staffWithScores[i].break === hour;
        let isSecurityHour = (hour === 12 || hour === 17 || hour === 19) && staffWithScores[i].security !== undefined;
        let reachedMaxObservations = staffWithScores[i].numObservations >= maxObs + 1;
				let reachedSecurityLimit = staffWithScores[i].security !== undefined && staffWithScores[i].numObservations >= staffWithScores[i].security;
        
        if (!hasObservationAlready && !hasSameLastObservation && !isOnBreak && !isSecurityHour && !reachedSecurityLimit /*&& !reachedMaxObservations*/) {
          let staffMember = staff.find(member => member.name === staffWithScores[i].name);
          staffMember.observations[hour] = observation.name;
          staffMember.numObservations++;
          assigned++;
          break;
        }
      }
    }
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


window.onload = function() {
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
                cell.innerText = 'Break';
            } else {
                cell.innerText = staff[j].observations[hour] || 'Break';
            }
        }
    }
}
