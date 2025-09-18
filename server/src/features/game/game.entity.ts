import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'simple-enum',
    enum: GameStatus,
    default: GameStatus.WAITING
  })
  status!: GameStatus;

  @Column('simple-array', { nullable: true })
  players!: string[];

  @Column('text', { nullable: true })
  board!: string; // JSON string of game board state

  @Column({ nullable: true })
  currentTurn!: string;

  @Column({ nullable: true })
  winner!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}