1. Implementation of symbol table.

#include <stdio.h> #include <stdlib.h> #include <string.h>

#define TABLE SIZE 100

typedef struct Symbol { char name[50]; char type[20]; int value; struct Symbol* next;

} Symbol;

typedef struct SymbolTable { Symbol* table[TABLE SIZE]; } SymbolTable;

unsigned int hash(char* name) { unsigned int hash = 0; while (*name) { hash= (hash * 31) + *name++;

}

return hash % TABLE SIZE;

}

SymbolTable* createSymbolTable() (

SymbolTable* st = (SymbolTable*)malloc(sizeof(SymbolTable));

for (int i = 0; i <TABLE_SIZE; i++) {

st->table[i]= NULL;

}

return st;

}

void insert(SymbolTable* st, char* name, char* type, int value) { unsigned int index = hash(name);

Symbol* newSymbol = (Symbol*)malloc(sizeof(Symbol));

strcpy(newSymbol->name, name);

strcpy(newSymbol->type, type);

newSymbol->value = value;

newSymbol->next = st->table[index];

st->table[index] = newSymbol;

printf("Inserted: %s\n", name);

Symbol* lookup(SymbolTable* st, char* name) { unsigned int index = hash(name); Symbol* current = st->table[index]; while (current) {

if (strcmp(current->name, name) 0) { return current;
current = current->next;

return NULL:

void display(SymbolTable* st) {

printf("\nSymbol Table:\n");

printf("Name\t\tType\t\tValue\n");

printf("

for (int i = 0; i <TABLE_SIZE; i++) {

Symbol* current = st->table[i];

while (current) {

printf("%s\t\t%s\t\t%d\n", current->name, current->type, current->value); current = current->next;

int main()

SymbolTable* st = createSymbolTable(); insert(st, "x", "int", 10); insert(st, "y", "float", 25); insert(st, "temp", "int", 100); insert(st, "result", "double", 45);

display(st);

Symbol* found = lookup(st, "x"); if (found) { printf("\nFound variable 'x': Type-%s, Value=%d\n", found->type, found->value);

return
