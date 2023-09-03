/*checkers.js*/

let originalPlaceholder = '';
let checkerIdCounter = 1;
let checkersBox = new Array();
let potentiallyDeadCheckers = new Map();
let enemyCheckerWasBeaten = false;
let moveCounterWithoutBeating = 0;
let moveSimulation = false;
let playingCheckersHasMove = false;
var numberOfTurn = 1;
const messages = [];




function checkNamesAndStartGame() {
	const player1Name = document.getElementsByName("player1")[0].value;
	const player2Name = document.getElementsByName("player2")[0].value;

	if (player1Name && player2Name) {
		window.location.href = `index.html?player1=${encodeURIComponent(player1Name)}&player2=${encodeURIComponent(player2Name)}`;
	} else {
		showErrorMessage("נא להזין שם לשני השחקנים");
	}
}

function showErrorMessage(message) {
	let errorMessageElement = document.getElementById("name-error");
	errorMessageElement.innerText = message;
	errorMessageElement.style.display = "block"; // הצגת ההודעה
}


function changeCursor(elementId) {   // פונקציה שמשנה את המראה כאשר העכבר נכנס לאלמנט
	document.getElementById(elementId).style.cursor = "default";
}

function resetCursor(elementId) {
	document.getElementById(elementId).style.cursor = "auto";
}

const urlParams = new URLSearchParams(window.location.search);
const player1Name = urlParams.get("player1");
const player2Name = urlParams.get("player2");

document.getElementById("player1Name").innerText = player1Name;
document.getElementById("player2Name").innerText = player2Name;

function clearPlaceholder(inputElement) {
	originalPlaceholder = inputElement.placeholder;
	inputElement.placeholder = '';
}

function resetPlaceholder(inputElement) {
	if (!inputElement.value) {
		inputElement.placeholder = originalPlaceholder;
	}
}

function handleInputChange(inputElement) {
	if (!inputElement.value) {
		clearPlaceholder(inputElement);
	} else {
		resetPlaceholder(inputElement);
	}
}


class Checker {
	constructor(color) {
		this.color = color;
		this.div = document.createElement("div");
		this.div.id = checkerIdCounter++;
		this.div.className = this.color;
		this.div.defaultStyle = this.div.style;
		this.div.className += this.color === "white" ? " playable" : "";
	}

	get piece() {
		return this.div;
	}

	markAvailableMoves = function () {  //  פונקציה שמסמנת את התאים בהם אפשר לנוע 
		this.registerRowAtClick();
		let availableCellsForMove = this.getCellsForAvailableMove();
		if (moveSimulation) {
			if (availableCellsForMove.length > 0) playingCheckersHasMove = true;
			return;
		}

		availableCellsForMove.forEach(c => c.style.backgroundColor = c.color);
	}

	registerRowAtClick = function () {
		this.div.rowNumberAtClick = getNumberFromId(this.div.parentElement.parentElement);
	}

	getCellsForAvailableMove = function () {
		let availableCellsForMove = new Array();  //  מערך לתאים שהכלי יכול באמת לזוז אליהם
		let destinationsForMove = new Array(); //  מערך לכל התאים הרלוונטים לתזוזה

		if (this.div.innerHTML) {                  //  אם הכלי מלא (מלך) - הוא יכול לזוז לכל כיוון
			destinationsForMove.push("upLeft");
			destinationsForMove.push("upRight");
			destinationsForMove.push("bottomLeft");
			destinationsForMove.push("bottomRight");
		}
		else if (this.color === "white") {           //  אם הכלי הוא לבן - הוא יכול לזוז רק למעלה
			destinationsForMove.push("upLeft");
			destinationsForMove.push("upRight");
		}
		else {                                      // אם הכלי הוא שחור - הוא יכול לזוז רק למטה
			destinationsForMove.push("bottomLeft");
			destinationsForMove.push("bottomRight");
		}

		this.findAllAvailableMoves(this.div.parentElement, destinationsForMove, availableCellsForMove, enemyCheckerWasBeaten);
		return availableCellsForMove;
	}

	// colorRgbaCells = function () {             // פונקציה שהוספתי כדי לצבוע תאים שלא ניתן לזוז אליהם לשקוף
	// 	const allCells = Array.from(document.getElementsByTagName("td"));
	// 	allCells.forEach(cell => {
	// 		if (!(cell.style.backgroundColor === "green"))
	// 			cell.style.backgroundColor = "rgba(0, 0, 0, 0)";
	// 	});
	// }

	findAllAvailableMoves = function (currentCell, destinationsForMove, availableCellsForMove, isEnemyCheckerBeaten) {    //  פונקציה שמוצאת את כל המקומות האפשריים, כולל התחשבות באכילת היריב
		destinationsForMove.forEach(d => {
			let nextCell = this.getNextMoveCell(currentCell, d);
			if (nextCell) {
				if (nextCell.childElementCount == 0 && !isEnemyCheckerBeaten) {
					nextCell.color = "green";                                // צובע בירוק את התאים שאפשר להתקדם אליהם




					availableCellsForMove.push(nextCell);

				}
				else {
					if (nextCell.childNodes[0] && !nextCell.childNodes[0].className.includes("playable")) {
						let newNextCell = this.getNextMoveCell(nextCell, d);
						if (newNextCell && newNextCell.childElementCount == 0) {
							if (!isEnemyCheckerBeaten) newNextCell.color = "green";   // צובע בירוק את התאים שאפשר להתקדם אליהם
							else newNextCell.color = "orange";
							availableCellsForMove.push(newNextCell);
							potentiallyDeadCheckers.set(newNextCell.id, nextCell.childNodes[0]);
						}
					}
				}

			}
		});
	}

	getNextMoveCell = function (currentCell, destination) {
		let currentCellNumber = getNumberFromId(currentCell);
		let currentRowNumber = getNumberFromId(currentCell.parentElement);
		let step;

		switch (destination) {
			case "upLeft": {
				if (currentRowNumber % 2 != 0) {
					step = -4;
				}
				else step = -5;
				break;
			}
			case "upRight": {
				if (currentRowNumber % 2 != 0) {
					step = -3;
				}
				else step = -4;
				break;
			}
			case "bottomLeft": {
				if (currentRowNumber % 2 != 0) {
					step = 4;
				}
				else step = 3;
				break;
			}
			case "bottomRight": {
				if (currentRowNumber % 2 != 0) {
					step = 5;
				}
				else
					step = 4;

				break;
			}
		}

		let nextCell = document.getElementById("cell_" + (currentCellNumber + step));
		if (!nextCell) return null;

		let nextRowNumber = getNumberFromId(nextCell.parentElement);
		if (Math.abs(nextRowNumber - currentRowNumber) != 1) nextCell = null;
		return nextCell;
	}
}


function drawBoard() {                    //  הפונקציה שיוצרת את לוח המשחק
	let board = document.getElementById("board");
	let cellIdCounter = 1;

	for (let i = 0; i < 8; i++) {
		let tr = document.createElement("tr");
		tr.id = "row_" + (i + 1);

		for (let j = 0; j < 8; j++) {
			let td = document.createElement("td");
			if (j % 2 == 0 && i % 2 != 0) {
				td.id = "cell_" + cellIdCounter++;
				td.className += " active";
			}
			else if (j % 2 != 0 && i % 2 == 0) {
				td.id = "cell_" + cellIdCounter++;
				td.className += " active";
			}

			td.onclick = function () {                                   //  פונקציה המופעלת בלחיצה על הכלי שרוצים להזיז
				
				if (td.className.includes("active")) {
					if (this.style.backgroundColor === "green" || this.style.backgroundColor === "orange") {
						let playableCheckers = Array.from(document.getElementsByClassName("playable"));
						let checkerToMove = playableCheckers.filter(c => c.style.backgroundColor === "green")[0];  // אולי לנסות להוריד את הפילטור?
						this.appendChild(checkerToMove);
						tryToBecomeKing(this);
						if (enemyCheckerWasBeaten = checkIfWasBeat(checkerToMove)) {
							removeBeatenCheckers(this);
							checkerToMove.click();
							if (Array.from(document.getElementsByTagName("td")).filter(c => c.style.backgroundColor == "orange").length > 0) {   // אם היה כתום - אל תאפשר ליריב לקבל תור עדיין
								freezePlayableCheckers();
								return;
							}
						}

						cellsToDefaultStyle();     //  חזרה לעיצוב דיפולטיבי - תאים
						checkersToDefaultStyle();  //  חזרה לעיצוב דיפולטיבי - כלים
						switchTurn();              // החלפת תאים
						removeBeatenCheckers(this);  // הסרה של כלים שנאכלו
						checkForAGameStatus();       // בדיקת סטטוס המשחק

					}
					
					
					 //else if (!(this.style.backgroundColor === "green") && (!(this.style.backgroundColor === "orange"))) {   // הבאתי מהפונקציה של בדיקה האם נאכל
					//	tryToPressEmptyBlackCell();
					// 	let currentRowNumber = getNumberFromId(checkerToMove.parentElement.parentElement);
					// 	if (Math.abs(currentRowNumber - checkerToMove.rowNumberAtClick) == 1) {
					// 		tryToMoveToNonPlayableCell();
					// 	}

					}
					else                               //נגיעה במשבצת לבנה
						tryToMoveToNonPlayableCell();
				}
				tr.appendChild(td);
			}
			board.appendChild(tr)
		}
	}


	function createCheckers() {     // יצירת כלי המשחק
		let color = "red";

		for (let i = 1; i <= 24; i++) {
			if (i > 12) {
				color = "white";
			}
			let c = new Checker(color);

			c.piece.onclick = function () {    //  פונקציה המתממשת כאשר לוחצים עם העכבר על אחד הכלים
				let activeCells = Array.from(document.getElementsByClassName("active"));
				if (this.className.includes("playable")) {
					cellsToDefaultStyle();
					c.markAvailableMoves();
					checkersToDefaultStyle();
					if (activeCells.filter(cell => cell.style.backgroundColor === "green" || cell.style.backgroundColor === "orange").length > 0) {
						this.style.backgroundColor = "green";
						this.style.border = "5px solid yellow";
					}
				}
			};
			checkersBox.push(c);
		}
	}

	function placeCheckersOnBoard() {
		let cells = document.getElementsByClassName("active");

		// placing red checkers
		for (let i = 0; i < 12; i++) {
			cells[i].appendChild(checkersBox[i].piece);

		}

		//placing white checkers
		for (let i = 12; i < 24; i++) {
			cells[i + 8].appendChild(checkersBox[i].piece);
		}
	}

	function cellsToDefaultStyle() {
		Array.from(document.getElementsByClassName("active")).forEach(c => {
			if (c.hasOwnProperty("color")) c.color = "";
			c.style.backgroundColor = "#474b52";
		});
	}

	function checkersToDefaultStyle() {       //  מסדר את הכלים להיות בצורה הדיפולטיבית
		let teamCheckers = Array.from(document.getElementsByClassName("playable"));
		teamCheckers.forEach(ch => ch.style = ch.defaultStyle);
	}

	function getNumberFromId(el) {
		let elNumber = Number(el.id.substring(el.id.indexOf("_") + 1));
		return elNumber;
	}

	function removeBeatenCheckers(cell) {
		let potentiallyDeadChecker = potentiallyDeadCheckers.get(cell.id);
		if (potentiallyDeadChecker && potentiallyDeadChecker.parentNode) {
			potentiallyDeadChecker.parentNode.removeChild(potentiallyDeadChecker);
		}
	}

	function checkIfWasBeat(checker) {
		let wasBeat;
		let currentRowNumber = getNumberFromId(checker.parentElement.parentElement);
		if (Math.abs(currentRowNumber - checker.rowNumberAtClick) == 2) {
			wasBeat = true;
			moveCounterWithoutBeating = 0;
		}
		else {
			wasBeat = false;
			moveCounterWithoutBeating++;
		}
		return wasBeat;
	}

	function freezePlayableCheckers() {   // מקפיא תור ליריב כאשר יש יכולת לאכול לו כלי נוסף
		let checkersToFreeze = Array.from(document.getElementsByClassName("playable"));
		checkersToFreeze.forEach(ch => ch.style.pointerEvents = "none");
	}

	// function switchTurn() {            // החלפת תור
	// 	checkersBox.forEach(c => {
	// 		let divClassName = c.piece.className;
	// 		if (divClassName.includes("playable")) divClassName = divClassName.substring(0, divClassName.indexOf("playable"));
	// 		else divClassName += " playable";
	// 		c.piece.className = divClassName;
	// 	});
	// 	enemyCheckerWasBeaten = false;
	// 	potentiallyDeadCheckers = new Map();

	// }

	function switchTurn() {            // החלפת תור
		checkersBox.forEach(c => {
			let divClassName = c.piece.className;
			if (divClassName.includes("playable")) divClassName = divClassName.substring(0, divClassName.indexOf("playable"));
			else divClassName += " playable";
			c.piece.className = divClassName;
		});
		enemyCheckerWasBeaten = false;
		potentiallyDeadCheckers = new Map();


		removePreviousTurnMessage();

		// הצג את ההודעה החדשה
		if ((numberOfTurn % 2) === 0) {
			const message = `התור של : ${player1Name}`;
			showPlayerTurnMessage(message);
		} else {
			const message = `התור של : ${player2Name}`;
			showPlayerTurnMessage(message);
		}
		numberOfTurn++;
	}

	function showPlayerTurnMessage(message) {
		messages.push(message);
		displayNextMessage();
	}

	function displayNextMessage() {
		if (messages.length > 0) {
			const message = messages.shift();
			const turnMessageElement = document.createElement("div");
			turnMessageElement.className = "turn-message";
			turnMessageElement.innerText = message;
			document.body.appendChild(turnMessageElement);
		}
	}

	function removePreviousTurnMessage() {
		const previousTurnMessage = document.querySelector(".turn-message");
		if (previousTurnMessage) {
			previousTurnMessage.remove();
		}
		if (tryToMoveToNonPlayableCell === true)
			previousTurnMessage.remove();
	}


	function tryToBecomeKing(cellToCheck) {
		let checker = cellToCheck.childNodes[0];
		let rowNumber = getNumberFromId(cellToCheck.parentNode);
		if ((rowNumber == 1 || rowNumber == 8) && !checker.innerHTML) checker.innerHTML = "K";
	}

	function showWinnerAlert(winner) {
		const alertContainer = document.getElementById("alertContainer");
		const customAlert = document.getElementById("customAlert");

		customAlert.classList.remove("d-none");
		customAlert.innerHTML = `${winner} הם המנצחים <button type="button" class="btn btn-primary" id="liveAlertBtn">להתחלת משחק חדש <a id="NewGameButton" href="./startform.html" class="alert-link">לחץ כאן</a></button>`;
		customAlert.scrollIntoView(); // גלילה לצורך הצגת ההודעה	
	}

	function checkForAGameStatus() {
		let statusMessage;

		//בדיקה על נצחון של צד אחד
		let redCheckers = Array.from(document.getElementsByTagName("div")).filter(ch => ch.className.includes("red"));
		let whiteCheckers = Array.from(document.getElementsByTagName("div")).filter(ch => ch.className.includes("white"));
		if (redCheckers.length === 0) statusMessage = "הלבנים";
		else if (whiteCheckers.length === 0) statusMessage = "האדומים";
		//checking for a draw
		else if (moveCounterWithoutBeating === 40) statusMessage = "It's a draw!!!";
		//ניצחון בשל חוסר יכולת להזיז כלי
		else {
			let response = noMoveAvailableTest();
			if (!response.hasMove) statusMessage = response.winningSide + " are the winners by blocking";
		}

		if (statusMessage) {
			showWinnerAlert(statusMessage);
		}
	}

	function noMoveAvailableTest() {
		let responseObj = { winningSide: "", hasMove: false };
		let playingCheckers = Array.from(document.getElementsByClassName("playable"));
		responseObj.winningSide = playingCheckers[0].className.includes("white") ? "Reds" : "Whites";
		//simulating a move
		moveSimulation = true;
		for (let checker of playingCheckers) {
			checker.click();
			if (playingCheckersHasMove) {
				moveSimulation = false;
				playingCheckersHasMove = false;
				responseObj.hasMove = true;
				return responseObj;
			}
		}
		return responseObj;
	}

	function displayErrorMessage(message) {                               // הקפצת מסר למשתמש לשלוש שניות
		const errorMessageElement = document.createElement("div");
		errorMessageElement.className = "error-message";
		errorMessageElement.innerText = message;

		document.body.appendChild(errorMessageElement);

		setTimeout(() => {
			document.body.removeChild(errorMessageElement);
		}, 3000);
	}

	function tryToMoveToNonPlayableCell() {
		displayErrorMessage("לחצת במשבצת לא חוקית");
	}

	function tryToPressEmptyBlackCell() {
		displayErrorMessage("נא למקם את הכלי שלך במשבצת ירוקה");
	}


	function startTheGame() {
		drawBoard();
		createCheckers();
		placeCheckersOnBoard();
	}

	startTheGame();