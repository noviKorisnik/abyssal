import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  @Input() board!: any[][]; // 2D array of board data
  @Input() getCellClasses!: (x: number, y: number) => any; // Function to get cell classes
  @Input() isInteractive: boolean = false; // Whether cells are clickable
  @Input() showYourTurnIndicator: boolean = false; // Whether to show the "your turn" border/glow
  @Output() cellClick = new EventEmitter<{ x: number; y: number }>();

  onCellClick(x: number, y: number): void {
    if (this.isInteractive) {
      this.cellClick.emit({ x, y });
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
