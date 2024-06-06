const std = @import("std");
const tst = std.testing;

pub fn add(a: i32, b: i32) i32 {
    return a + b;
}

test "main.add" {
    try tst.expectEqual(3, add(1, 2));
}

pub fn main() void {
    std.debug.print("engine\n", .{});
}
