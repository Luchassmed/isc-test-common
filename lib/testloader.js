// Indlæser de test cases der er aktive for miljøet.
//
// Der ledes to steder: de basale tests i dette fælles repo, og kundens egne tests
// i kunderepoet. Kundens tests ligger uden for common med vilje — de skal ikke
// kunne blive ramt af en opdatering af det fælles repo.

const fs = require('fs');
const path = require('path');

function indlaes({ aktive, commonRod, kundeRod }) {
  // path.resolve, ikke path.join: require() kræver en absolut sti. Med en relativ
  // --kunde-rod (fx ".") ville path.join give "testcases/custom", som Node ville
  // lede efter som et pakkenavn i node_modules i stedet for som en mappe.
  const mapper = [path.resolve(commonRod, 'testcases', 'basic'), path.resolve(kundeRod, 'testcases', 'custom')];

  const fundne = new Map();
  for (const mappe of mapper) {
    if (!fs.existsSync(mappe)) continue;
    for (const fil of fs.readdirSync(mappe).filter((f) => f.endsWith('.js'))) {
      const tc = require(path.join(mappe, fil));
      fundne.set(tc.id, tc);
    }
  }

  // Rækkefølgen i config bestemmer eksekveringsrækkefølgen.
  const tests = aktive.filter((id) => fundne.has(id)).map((id) => fundne.get(id));
  const manglende = aktive.filter((id) => !fundne.has(id));

  return { tests, manglende };
}

module.exports = { indlaes };
