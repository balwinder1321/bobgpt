include <stdio.h>

#include <stdlib.h>

#include <ctype.h>

#include <string.h>

char keywords[10][10]= {

"int", "float", "if", "else", "while", "return", "for", "char", "void", "double"

int isKeyword(char* str) { for (int i = 0; i<10; i++) { if (strcmp(str, keywords[i]) ==0) return 1;

return 0;

void analyze(FILE* fp) {

char ch, buffer[100];

int i=0;

while ((ch = fgetc(fp)) != EOF) {

// Skip whitespace

if (isspace(ch)) continue;

// Identifier or keyword

if (isalpha(ch)) {

buffer[i++]=ch;

while (isalnum(ch = fgetc(fp)) || ch=')

buffer[i++]= ch;

buffer[i] = \0';

i=0;

ungetc(ch, fp);

if (isKeyword(buffer)) printf("Keyword: %s\n", buffer);

else

printf("Identifier: %s\n", buffer);

}

// Number

else if (isdigit(ch)) {

buffer[i++]= ch;

while (isdigit(ch = fgetc(fp)))

buffer[i++]= ch;

buffer[i]= \0';

i=0;

ungetc(ch, fp);

printf("Number: %s\n", buffer);

// Operators

else if (ch== '+' || ch=='-' || ch== '* || ch=/' || ch='=') {
printf("Operator: %c\n", ch);

// Special symbols

printf("Special Symbol: %c\n", ch);

// Unknown

else {

printf("Unknown character: %c\n", ch);

int main() {

FILE* fp = fopen("source.c", "r");

printf("Error: Cannot open file.\n");

return 1;

printf("Lexical Analysis Output:\n\n");

analyze(fp);

fclose(fp);

return
