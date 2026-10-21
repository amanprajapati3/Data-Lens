import assert from "node:assert/strict";
import {
  csvToJson,
  detectDelimiter,
  jsonToCsv,
  parseCsvRows,
} from "./csv";

let passed = 0;

let failed = 0;

function test(name: string, run: () => void): void {
  try {
    run();
    passed++;
    console.log(`ok   ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

const ORDERS_CSV = `OrderID,OrderDate,Customer,Product,Category,Quantity,UnitPrice,City,PaymentStatus,Total
DL1001,2026-10-01,Aman Sharma,Wireless Mouse,Electronics,2,799,Delhi,Paid,1598
DL1002,2026-10-02,Priya Verma,Notebook Set,Stationery,3,250,Mumbai,Paid,750
DL1003,2026-10-03,Rohan Iyer,Coffee Mug,Home & Kitchen,1,499,Chennai,Paid,499
DL1004,2026-10-04,Sneha Rao,Desk Lamp,Electronics,2,1299,Bengaluru,Pending,2598
DL1005,2026-10-05,Vikram Singh,Yoga Mat,Sports,1,899,Delhi,Paid,899
DL1006,2026-10-06,Anita Das,Wall Clock,Home & Kitchen,2,649,Kolkata,Paid,1298
DL1007,2026-10-07,Karan Mehta,USB Cable,Electronics,5,199,Pune,Paid,995
DL1008,2026-10-08,Neha Gupta,Notebook Set,Stationery,4,250,Mumbai,Paid,1000
DL1009,2026-10-09,Arjun Nair,Backpack,Bags,1,1599,Kochi,Pending,1599
DL1010,2026-10-10,Fatima Khan,Water Bottle,Home & Kitchen,3,349,Hyderabad,Paid,1047
DL1011,2026-10-11,Dev Patel,Mouse Pad,Electronics,2,299,Ahmedabad,Paid,598
DL1012,2026-10-12,Ishita Reddy,Bookshelf,Home & Kitchen,1,2499,Hyderabad,COD,2499
`;

const EXPECTED_ORDERS = [
  {
    OrderID: "DL1001",
    OrderDate: "2026-10-01",
    Customer: "Aman Sharma",
    Product: "Wireless Mouse",
    Category: "Electronics",
    Quantity: 2,
    UnitPrice: 799,
    City: "Delhi",
    PaymentStatus: "Paid",
    Total: 1598,
  },
  {
    OrderID: "DL1002",
    OrderDate: "2026-10-02",
    Customer: "Priya Verma",
    Product: "Notebook Set",
    Category: "Stationery",
    Quantity: 3,
    UnitPrice: 250,
    City: "Mumbai",
    PaymentStatus: "Paid",
    Total: 750,
  },
];

test("maps every value to its own column (example CSV)", () => {
  const csv = `OrderID,OrderDate,Customer,Product,Category,Quantity,UnitPrice,City,PaymentStatus,Total
DL1001,2026-10-01,Aman Sharma,Wireless Mouse,Electronics,2,799,Delhi,Paid,1598
DL1002,2026-10-02,Priya Verma,Notebook Set,Stationery,3,250,Mumbai,Paid,750`;

  assert.deepEqual(csvToJson(csv), EXPECTED_ORDERS);
});

test("12 order rows with 10 columns incl. Home & Kitchen", () => {
  const rows = csvToJson(ORDERS_CSV);

  assert.equal(rows.length, 12);

  for (const row of rows) {
    assert.equal(Object.keys(row).length, 10);
  }

  assert.deepEqual(rows[0], EXPECTED_ORDERS[0]);

  const categories = rows.map((row) => row.Category);

  assert.equal(
    categories.filter((value) => value === "Home & Kitchen").length,
    4,
  );
});

test("numbers become JSON numbers, identifiers and dates stay strings", () => {
  const [order] = csvToJson(ORDERS_CSV);

  assert.equal(typeof order.OrderID, "string");
  assert.equal(order.OrderID, "DL1001");
  assert.equal(order.OrderDate, "2026-10-01");
  assert.equal(typeof order.Quantity, "number");
  assert.equal(typeof order.UnitPrice, "number");
  assert.equal(typeof order.Total, "number");
  assert.equal(order.Total, 1598);
});

test("quoted commas, escaped quotes and line breaks", () => {
  const csv = `id,notes,amount
1,"Hello, world",10
2,"She said ""hi""",20
3,"line one
line two",30`;

  const rows = csvToJson(csv);

  assert.equal(rows.length, 3);
  assert.equal(rows[0].notes, "Hello, world");
  assert.equal(rows[1].notes, 'She said "hi"');
  assert.equal(rows[2].notes, "line one\nline two");
  assert.equal(rows[2].amount, 30);
});

test("tab separated files are detected and split", () => {
  const csv = "OrderID\tCustomer\tTotal\nDL1\tAman\t100\nDL2\tPriya\t250";

  assert.equal(detectDelimiter(csv), "\t");

  assert.deepEqual(csvToJson(csv), [
    { OrderID: "DL1", Customer: "Aman", Total: 100 },
    { OrderID: "DL2", Customer: "Priya", Total: 250 },
  ]);
});

test("semicolon separated files are detected and split", () => {
  const csv = "id;name;price\n1;Wireless Mouse;799\n2;Notebook Set;250";

  assert.equal(detectDelimiter(csv), ";");

  assert.deepEqual(csvToJson(csv), [
    { id: 1, name: "Wireless Mouse", price: 799 },
    { id: 2, name: "Notebook Set", price: 250 },
  ]);
});

test("a comma inside a quoted value does not fake a delimiter", () => {
  assert.equal(detectDelimiter('"Last, First";Age\nSharma;30'), ";");
});

test("empty cells stay empty strings", () => {
  const rows = csvToJson("a,b,c\n1,,3\n,,");

  assert.deepEqual(rows[0], { a: 1, b: "", c: 3 });
  assert.equal(rows.length, 1);
});

test("leading zero identifiers and odd numerics are preserved", () => {
  const rows = csvToJson('Code,Qty,Rating\n007,5,\n0034,0,"1,234"\n1.5,0.5,-2.5');

  assert.equal(rows[0].Code, "007");
  assert.equal(rows[0].Qty, 5);
  assert.equal(rows[0].Rating, "");
  assert.equal(rows[1].Code, "0034");
  assert.equal(rows[1].Qty, 0);
  assert.equal(rows[1].Rating, "1,234");
});

test("blank lines are skipped", () => {
  const rows = csvToJson("a,b\n\n1,2\n\n   \n3,4");

  assert.equal(rows.length, 2);
  assert.deepEqual(rows[1], { a: 3, b: 4 });
});

test("duplicate headers are renamed instead of dropped", () => {
  const rows = csvToJson("Name,Name,Age\nAlice,Bob,30");

  assert.deepEqual(rows[0], { Name: "Alice", Name_2: "Bob", Age: 30 });
});

test("an explicit delimiter can be forced", () => {
  const rows = csvToJson("a|b\n1|2", "|");

  assert.deepEqual(rows, [{ a: 1, b: 2 }]);
});

test("single column files still convert", () => {
  assert.deepEqual(csvToJson("name\nAlice\nBob"), [{ name: "Alice" }, { name: "Bob" }]);
});

test("jsonToCsv output round trips through csvToJson", () => {
  const source = [{ a: 1, b: "x,y", c: "2026-10-01" }];

  assert.deepEqual(csvToJson(jsonToCsv(source)), source);
});

test("empty input raises a clear error", () => {
  assert.throws(() => csvToJson("   \n  "), /CSV input is empty/);
});

test("missing header row raises a clear error", () => {
  assert.throws(() => csvToJson(",,,\n1,2,3,4"), /missing a header row/);
});

test("header without data raises a clear error", () => {
  assert.throws(() => csvToJson("name,age"), /no data rows/);
});

test("row length mismatch raises a clear error with the row number", () => {
  assert.throws(
    () => csvToJson("a,b,c\n1,2,3\n4,5"),
    /Row 3 has 2 columns, but the header row has 3/,
  );

  assert.throws(
    () => csvToJson("a,b\n1,2,3"),
    /Row 2 has 3 columns, but the header row has 2/,
  );
});

test("malformed CSV raises a clear error", () => {
  assert.throws(() => csvToJson('id,notes\n1,"unclosed'), /unclosed quoted value/);
});

test("parseCsvRows honours a custom delimiter", () => {
  assert.deepEqual(parseCsvRows("a;b\n1;2", ";"), [
    ["a", "b"],
    ["1", "2"],
  ]);
});

console.log(`\n${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exitCode = 1;
}
