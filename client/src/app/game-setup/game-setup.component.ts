import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameConfig } from './game-config.model';
import { BoardCell, GameSetup } from './game-setup.model';
import { generateGameSetup } from './game-setup.util';
import { GameSetupService } from './game-setup.service';
import { PlayerNameService } from '../services/player-name.service';

@Component({
    selector: 'app-game-setup',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './game-setup.component.html',
    styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent implements OnInit {
    gameConfig!: GameConfig;
    gameSetup?: GameSetup;
    boardGenerated = false;
    
    // Player name selection
    playerName: string = '';
    nameSuggestions: string[] = [];
    showNameSelector: boolean = false;
    loadingNames: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private gameSetupService: GameSetupService,
        private playerNameService: PlayerNameService,
        private router: Router
    ) {
        this.gameConfig = this.route.snapshot.data['gameConfig'];
    }

    ngOnInit() {
        // Check if player already has a name stored
        const storedName = this.playerNameService.getStoredPlayerName();
        if (storedName) {
            this.playerName = storedName;
        } else {
            // Show name selector for new players
            this.showNameSelector = true;
            this.loadNameSuggestions();
        }
    }

    loadNameSuggestions() {
        this.loadingNames = true;
        this.playerNameService.fetchNameSuggestions(8).subscribe({
            next: (names) => {
                this.nameSuggestions = names;
                // Auto-select first name
                if (names.length > 0 && !this.playerName) {
                    this.playerName = names[0];
                }
                this.loadingNames = false;
            },
            error: (err) => {
                console.error('Failed to load names:', err);
                this.loadingNames = false;
            }
        });
    }

    requestNewNames() {
        this.loadNameSuggestions();
    }

    toggleNameSelector() {
        this.showNameSelector = !this.showNameSelector;
        if (this.showNameSelector && this.nameSuggestions.length === 0) {
            this.loadNameSuggestions();
        }
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

    goBack() {
        // Navigate back to home or previous screen
        this.router.navigate(['/']);
    }

    confirmReady() {
        if (!this.gameSetup || !this.playerName) return;
        
        // Save player name to session storage
        this.playerNameService.savePlayerName(this.playerName);
        
        this.gameSetupService.sendReady(this.gameSetup, this.playerName).subscribe({
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
