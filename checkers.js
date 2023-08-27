let checkerIdCounter = 1;
let checkersBox = new Array();
let potentiallyDeadCheckers = new Map();
let enemyCheckerWasBeaten = false;
let moveCounterWithoutBeating = 0;
let moveSimulation = false;
let playingCheckersHasMove = false;

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

	markAvailableMoves = function () {
		this.registerRowAtClick();
		let availableCellsForMove = this.getCellsForAvailableMove();
		if(moveSimulation) {
			if(availableCellsForMove.length > 0) playingCheckersHasMove = true;
			return;
		}
		availableCellsForMove.forEach(c => c.style.backgroundColor = c.color);
	}

	registerRowAtClick = function () {
		this.div.rowNumberAtClick = getNumberFromId(this.div.parentElement.parentElement);
	}

	getCellsForAvailableMove = function () {
		let availableCellsForMove = new Array();
		let destinationsForMove = new Array();

		if (this.div.innerHTML) {
			destinationsForMove.push("upLeft");
			destinationsForMove.push("upRight");
			destinationsForMove.push("bottomLeft");
			destinationsForMove.push("bottomRight");
		}
		else if (this.color === "white") {
			destinationsForMove.push("upLeft");
			destinationsForMove.push("upRight");
		}
		else {
			destinationsForMove.push("bottomLeft");
			destinationsForMove.push("bottomRight");
		}

		this.findAllAvailableMoves(this.div.parentElement, destinationsForMove, availableCellsForMove, enemyCheckerWasBeaten);
		return availableCellsForMove;
	}

	findAllAvailableMoves = function (currentCell, destinationsForMove, availableCellsForMove, isEnemyCheckerBeaten) {
		destinationsForMove.forEach(d => {
			let nextCell = this.getNextMoveCell(currentCell, d);
			if (nextCell) {
				if (nextCell.childElementCount == 0 && !isEnemyCheckerBeaten) {
					nextCell.color = "yellow";
					availableCellsForMove.push(nextCell);
				} 
				else {
					if (nextCell.childNodes[0] && !nextCell.childNodes[0].className.includes("playable")) {
						let newNextCell = this.getNextMoveCell(nextCell, d);
						if (newNextCell && newNextCell.childElementCount == 0) {
							if (!isEnemyCheckerBeaten) newNextCell.color = "yellow";
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
				else step = 4;
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

function drawBoard() {
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
			if (td.className.includes("active")) {
				td.onclick = function () {
					if (this.style.backgroundColor === "yellow" || this.style.backgroundColor === "orange") {
						let playableCheckers = Array.from(document.getElementsByClassName("playable"));
						let checkerToMove = playableCheckers.filter(c => c.style.backgroundColor === "green")[0];
						this.appendChild(checkerToMove);
						tryToBecomeKing(this);
						if (enemyCheckerWasBeaten = checkIfWasBeat(checkerToMove)) {
							removeBeatenCheckers(this);
							checkerToMove.click();
							if (Array.from(document.getElementsByTagName("td")).filter(c => c.style.backgroundColor == "orange").length > 0) {
								freezePlayableCheckers();
								return;
							}
						}
						cellsToDefaultStyle();
						checkersToDefaultStyle();
						switchTurn();
						removeBeatenCheckers(this);
						checkForAGameStatus();
					}
				};
			}
			tr.appendChild(td);
		}
		board.appendChild(tr)
	}
}

function createCheckers() {
	let color = "red";

	for (let i = 1; i <= 24; i++) {
		if (i > 12) {
			color = "white";
		}
		let c = new Checker(color);

		c.piece.onclick = function () {
			let activeCells = Array.from(document.getElementsByClassName("active"));
			if (this.className.includes("playable")) {
				cellsToDefaultStyle();
				c.markAvailableMoves();
				checkersToDefaultStyle();
				if (activeCells.filter(cell => cell.style.backgroundColor === "yellow" || cell.style.backgroundColor === "orange").length > 0) {
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

function checkersToDefaultStyle() {
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

function freezePlayableCheckers() {
	let checkersToFreeze = Array.from(document.getElementsByClassName("playable"));
	checkersToFreeze.forEach(ch => ch.style.pointerEvents = "none");
}

function switchTurn() {
	checkersBox.forEach(c => {
		let divClassName = c.piece.className;
		if (divClassName.includes("playable")) divClassName = divClassName.substring(0, divClassName.indexOf("playable"));
		else divClassName += " playable";
		c.piece.className = divClassName;
	});
	enemyCheckerWasBeaten = false;
	potentiallyDeadCheckers = new Map();
	
}

function tryToBecomeKing(cellToCheck) {
	let checker = cellToCheck.childNodes[0];
	let rowNumber = getNumberFromId(cellToCheck.parentNode);
	if ((rowNumber == 1 || rowNumber == 8) && !checker.innerHTML) checker.innerHTML = "K";	
}

function checkForAGameStatus() {
	let statusMessage;
	
	//one side winning check
	let redCheckers = Array.from(document.getElementsByTagName("div")).filter(ch => ch.className.includes("red"));
	let whiteCheckers = Array.from(document.getElementsByTagName("div")).filter(ch => ch.className.includes("white"));
	if (redCheckers.length === 0) statusMessage = "White are the winners!!!";
	else if (whiteCheckers.length === 0) statusMessage = "Reds are the winners!!!";
	//checking for a draw
	else if (moveCounterWithoutBeating === 40) statusMessage = "It's a draw!!!";
	//no move winner
	else{
		let response = noMoveAvailableTest();
		if(!response.hasMove) statusMessage = response.winningSide + " are the winners by blocking";
	}
	
	if (statusMessage) {
		setTimeout(function () {
			alert(statusMessage);
			location.reload();
		}, 300);
	} 
}

function noMoveAvailableTest(){
	let responseObj = {winningSide : "",hasMove : false};
	let playingCheckers = Array.from(document.getElementsByClassName("playable"));
	responseObj.winningSide = playingCheckers[0].className.includes("white") ? "Reds" : "Whites";
	//simulating a move
	moveSimulation = true;
	for(let checker of playingCheckers) {
		checker.click();
		if(playingCheckersHasMove) {
		   moveSimulation = false;
           playingCheckersHasMove = false;
           responseObj.hasMove = true;	
           return responseObj;		   
		}				
	}
	return responseObj;
}

function startTheGame() {
	drawBoard();
	createCheckers();
	placeCheckersOnBoard();
}

startTheGame();