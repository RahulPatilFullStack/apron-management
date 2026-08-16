import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Mirrors `stands.json`. `stand` is a natural unique code, used as PK. */
@Entity('stands')
export class Stand {
  @PrimaryColumn({ type: 'varchar' })
  stand: string;

  @Column({ type: 'varchar', nullable: true })
  apron: string | null;

  @Column({ type: 'varchar', nullable: true })
  terminal: string | null;
}
