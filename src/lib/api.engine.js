export default class Wrapper {
	constructor() {
		this.LAYOUT_COLS = 3;
		this.LAYOUT_ROWS = 3;

		this.REELS = [
			['b', 'b', 'c', 'b', 'a', 'd', 'e', 'd', 'a', 'a', 'e', 'b', 'a', 'd', 'c', 'c', 'e', 'e', 'c', 'd'],
			['d', 'b', 'e', 'e', 'e', 'b', 'c', 'b', 'a', 'd', 'd', 'e', 'a', 'a', 'b', 'c', 'c', 'd', 'c', 'a'],
			['d', 'c', 'a', 'e', 'c', 'a', 'c', 'b', 'a', 'e', 'd', 'e', 'a', 'b', 'b', 'e', 'b', 'd', 'c', 'd']
		];
		/*
				CELL POSITIONS
				0 1 2
				3 4 5
				6 7 8
		*/
		this.PAYLINES = [
			[3, 4, 5],
			[0, 1, 2],
			[6, 7, 8],
			[0, 4, 8],
			[6, 4, 2]
		];
		this.PAYTABLE = [
			{ symbol: "a", prize: 100 },
			{ symbol: "b", prize: 80 },
			{ symbol: "c", prize: 50 },
			{ symbol: "d", prize: 30 },
			{ symbol: "e", prize: 1 }
		];
	}
	//DATA
	getReels() {
		return this.REELS;
	}
	getPaylines() {
		return this.PAYLINES;
	}
	getPaytable() {
		return this.PAYTABLE;
	}
	//ACTIONS
	spin() {
		var stop_points = this.getRandomStops();
		var prizes = this.getPrizes(stop_points);
		var result = this.getResultData(stop_points, prizes);
		return result;
	}
	getRandomStops() {
		var sp = new Array();
		var rnd;
		for (var i = 0; i < this.LAYOUT_COLS; i++) {
			rnd = Math.floor(Math.random() * this.REELS[i].length);
			sp.push(rnd);
		}
		//return [0, 0, 0];
		return sp;
	}
	getPrizes(sp) {
		var layout = this.getGridLayout(sp);
		var prizes = [];
		var prize = null;
		for (var i = 0; i < this.PAYLINES.length; i++) {
			prize = this.getLinePrize(i, layout);
			if (prize != null) {
				prizes.push(prize);
			}
		}
		return prizes;
	}
	getResultData(sp, prizes) {
		var result = {};
		result.stopPoints = sp;
		result.layout = this.getGridLayout(sp);
		result.reelsLayout = [
			this.getReelLayout(0, sp[0]),
			this.getReelLayout(1, sp[1]),
			this.getReelLayout(2, sp[2])
		];
		result.prizes = prizes;
		result.winnings = 0;
		for (var i = 0; i < prizes.length; i++) {
			result.winnings += prizes[i].winnings;
		}
		return result;
	}
	getGridLayout(sp) {
		var grid = [];
		var reel = null;
		for (var i = 0; i < this.LAYOUT_COLS; i++) {
			reel = this.getReelLayout(i, sp[i]);
			grid.push(reel);
		}
		var layout = [];
		var col = 0;
		var row = 0;
		var symId = null;
		while (row < this.LAYOUT_ROWS) {
			symId = grid[col][row];
			layout.push(symId);
			col++;
			if (col == this.LAYOUT_COLS) {
				col = 0;
				row++;
			}
		}
		return layout;
	}
	getReelLayout(reelId, sp) {
		var reel = this.REELS[reelId];
		var index = sp;
		var symId = null;
		var layout = [];
		for (var i = 0; i < this.LAYOUT_ROWS; i++) {
			if (index >= reel.length) {
				index = 0;
			}
			var symId = reel[index];
			layout.push(symId);
			index++;
		}
		return layout;
	}
	getLinePrize(lineId, layout) {
		var line = this.PAYLINES[lineId];
		var firstSymId = layout[line[0]];
		var hasPrize = true;
		var symPos = null;
		for (var i = 1; i < line.length; i++) {
			symPos = line[i];
			if (layout[symPos] != firstSymId) {
				hasPrize = false;
				break;
			}
		}
		var prize = null;
		if (hasPrize) {
			prize = {};
			prize.lineId = lineId;
			prize.symId = firstSymId;
			prize.winnings = this.getSymbolPrize(firstSymId);
		}
		return prize;
	}
	getSymbolPrize(symId) {
		var symConfig = null;
		var prize = 0;
		for (var i = 0; i < this.PAYTABLE.length; i++) {
			symConfig = this.PAYTABLE[i];
			if (symId == symConfig.symbol) {
				prize = symConfig.prize;
			}
		}
		return prize;
	}
}












// wrapper = new Wrapper();
// console.log(wrapper.getReels());
// console.log(wrapper.getPaylines());
// console.log(wrapper.getPaytable());
// console.log(wrapper.spin());