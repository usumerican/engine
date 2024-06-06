const std = @import("std");
const tst = std.testing;
const main = @import("main.zig");

export fn add(a: i32, b: i32) i32 {
    return main.add(a, b);
}

test "wasm.add" {
    try tst.expectEqual(3, add(1, 2));
}
