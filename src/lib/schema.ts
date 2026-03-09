import { pgTable, text, timestamp, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id'), // Optional for now to avoid breaking existing data
    title: text('title').notNull(),
    content: text('content').notNull(),
    summary: text('summary'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const concepts = pgTable('concepts', {
    id: uuid('id').defaultRandom().primaryKey(),
    noteId: uuid('note_id').references(() => notes.id, { onDelete: 'cascade' }).notNull(),
    concept: text('concept').notNull(),
    explanation: text('explanation').notNull(),
});

export const quizzes = pgTable('quizzes', {
    id: uuid('id').defaultRandom().primaryKey(),
    noteId: uuid('note_id').references(() => notes.id, { onDelete: 'cascade' }).notNull(),
    userId: text('user_id'),
    title: text('title').notNull(),
    score: text('score'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const questions = pgTable('questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    quizId: uuid('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
    questionText: text('question_text').notNull(),
    options: jsonb('options').notNull(), // Array of string options
    correctOptionIndex: text('correct_option_index').notNull(),
});

export const chatMessages = pgTable('chat_messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    noteId: uuid('note_id').references(() => notes.id, { onDelete: 'cascade' }).notNull(),
    role: text('role').notNull(), // 'user' or 'ai'
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
