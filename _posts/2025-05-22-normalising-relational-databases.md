---
title: Normalising databases
tags:
    - Databases
    - Data
    - Normalisation
---
Data normalisation is the process of structuring a relational database 'in accordance with a series of so-called **normal forms** in order to reduce data redundancy and improve data integrity'. That means, when we try to insert, update, or delete data, there should be no unintended side effects such as duplicated data or accidental deletions.

For example; if a table contains columns for `name`, `age`, and `pets`, and Ralph has two fish and a cat. The table might look like this:

**pets**

| id | name  | age |          pets         |
|----|-------|-----|-----------------------|
| 1  | Ralph | 10  | one cat and two fish  |

This data is unnormalised. If we want to know how many animals of each type are in the database we'd have to query the pets column and manually calculate. We can begin the normalisation process by making sure the data satisfies the **first normal form (1NF)**. To do so, each field has to contain a single value. For example:

**pets**

| id | name  | age | pet  |
|----|-------|-----|------|
| 1  | Ralph | 10  | cat  |
| 2  | Ralph | 10  | fish |
| 3  | Ralph | 10  | fish |

We've solved the problem, and can now count how many pets there are in the database, and their types. However, we've introduced a new problem: there's duplication of the age and name fields. Each year, on Ralph's birthday, you'd need to update three rows. And if all of Ralph's pets died and we removed each row from the table, we would lose all information about Ralph from the database.

To fix this, we can break up the data into two separate tables: one for `persons` details and one for `pets` details. The two tables would be linked by their primary and foreign keys. In this case, then pets are added or removed from the database, the person's details aren't deleted, and when the person's details are updated, the pets' details remain untouched. This satisfies the **second normal form (2NF)**.

**pets**

| id | pet  | owner (FK) |
|----|------|------------|
|  1 | cat  |     1      |
|  2 | fish |     1      |
|  3 | fish |     1      |

V V V V V V V V V V V V V V V V V V

**persons**

| id | name  | age |
|----|-------|-----|
| 1  | Ralph | 10  |

One person can own many pets, and if they live with someone else, that means many people own many pets. If Ralph lived with Lisa and they both owned a cat, the `pets` table would look something like this:

**pets**

| id | pet  | owner (FK) |
|----|------|------------|
|  1 | cat  |     1      |
|  2 | cat  |     2      |
|  3 | fish |     1      |
|  4 | fish |     1      |

V V V V V V V V V V V V V V V V V V

**persons**

| id | name  | age |
|----|-------|-----|
| 1  | Ralph | 10  |
| 2  | Lisa  | 11  |

Once again, we have a problem of duplicated data: are cats 1 and 2 the same cat or different cats? This is the result of the **many-to-many** relationship between persons and pets. To model this many-to-many relationship properly, we need to find a common attribute that we can put into its own table. In this case, the common attribute between Lisa and Ralph and their cat is their ownership. By joining `persons` to `pets` via an `owner` table, we eliminate the many-to-many relationship.

**pets**

| id | pet  |
|-----------|
|  1 | cat  |
|  2 | fish |
|  3 | fish |

V V V V V V V V V V V V V V V V V V

**owners**

| id | pet_id | owner_id |
|----|--------|----------|
| 1  |   1    |     1    |
| 2  |   1    |     2    |
| 3  |   2    |     1    |

^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^

**persons**

| id | name  | age |
|----|-------|-----|
| 1  | Ralph | 10  |
| 2  | Lisa` | 11  |
| 3  | Bart  | 12  |

The database now satisfies the **third normal form (3NF)**, we can say it's **normalised**. The persons, owners, and pets tables can all be updated independently of other another. Each person can be an owner of one or more pets, and each pet can have one or more owners. There can even be pets without owners (fish 3) and persons without pets (Bart).

## Read more

- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization) on Wikipedia
- [A Simple Guide to Five Normal Forms in Relational Database Theoryi, 1982](https://www.bkent.net/Doc/simple5.htm)
-
