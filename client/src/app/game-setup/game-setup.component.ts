import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameConfig } from './game-config.model';
import { BoardCell, GameSetup } from './game-setup.model';
import { generateGameSetup } from './game-setup.util';

@Component({
    selector: 'app-game-setup',
    templateUrl: './game-setup.component.html',
    styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent {
    gameConfig!: GameConfig;
    gameSetup?: GameSetup;
    boardGenerated = false;

    constructor(private route: ActivatedRoute) {
        this.gameConfig = this.route.snapshot.data['gameConfig'];
    }

    get boardRows(): number[] {
        return Array.from({ length: this.gameConfig.boardRows }, (_, i) => i);
    }
    get boardCols(): number[] {
        return Array.from({ length: this.gameConfig.boardCols }, (_, i) => i);
    }

    getCell(row: number, col: number): BoardCell | undefined {
        return this.gameSetup?.board[row]?.[col];
    }

    generateBoard() {
        this.gameSetup = generateGameSetup(this.gameConfig);
        this.boardGenerated = true;
    }

    confirmReady() {
        // TODO: implement ready logic
    }
}
