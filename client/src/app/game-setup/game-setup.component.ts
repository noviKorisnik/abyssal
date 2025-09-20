import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfig } from './game-config.model';
import { BoardCell, GameSetup } from './game-setup.model';
import { generateGameSetup } from './game-setup.util';
import { GameSetupService } from './game-setup.service';

@Component({
    selector: 'app-game-setup',
    templateUrl: './game-setup.component.html',
    styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent {
    gameConfig!: GameConfig;
    gameSetup?: GameSetup;
    boardGenerated = false;

    constructor(
        private route: ActivatedRoute,
        private gameSetupService: GameSetupService,
        private router: Router
    ) {
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
        if (!this.gameSetup) return;
        this.gameSetupService.sendReady(this.gameSetup).subscribe({
            next: ({ gameId }) => {
                // Redirect to game/lobby screen (adjust route as needed)
                this.router.navigate(['/game', gameId]);
            },
            error: err => {
                // Handle error (show message, etc.)
                alert('Failed to join game: ' + (err?.message || err));
            }
        });
    }
}
