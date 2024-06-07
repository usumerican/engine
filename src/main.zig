const std = @import("std");
const tst = std.testing;
const builtin = @import("builtin");

pub const Str = []const u8;

fn strEql(a: Str, b: Str) bool {
    return std.mem.eql(u8, a, b);
}

fn strStartsWith(haystack: Str, needle: Str) bool {
    return std.mem.startsWith(u8, haystack, needle);
}

extern fn dateNow() i64;

pub fn milliTimestamp() i64 {
    if (builtin.cpu.arch == .wasm32 and builtin.os.tag == .freestanding) {
        return dateNow();
    } else {
        return std.time.milliTimestamp();
    }
}

pub const Engine = struct {
    allocator: std.mem.Allocator,
    state: enum { ready, running, stopping } = .ready,

    pub fn run(self: *@This(), request: Str) !Str {
        var output = std.ArrayList(u8).init(self.allocator);
        const writer = output.writer();
        if (self.state == .ready) {
            self.state = .running;
            defer self.state = .ready;
            if (strEql(request, "target")) {
                try writer.print("{s}, {s}, {s}, {s}\n", .{
                    @tagName(builtin.os.tag),
                    @tagName(builtin.cpu.arch),
                    builtin.cpu.model.name,
                    @tagName(builtin.mode),
                });
            } else if (strStartsWith(request, "go")) {
                const time = milliTimestamp();
                var i: usize = 0;
                while (true) : (i += 1) {
                    if (milliTimestamp() - time > 5000) {
                        try writer.print("done: {d}\n", .{i});
                        break;
                    }
                    if (self.state != .running) {
                        try writer.print("stopped: {d}\n", .{i});
                        break;
                    }
                }
            }
        }
        return output.toOwnedSlice();
    }

    pub fn stop(self: *@This()) void {
        if (self.state == .running) {
            self.state = .stopping;
        }
    }
};

fn go(engine: *Engine, req: Str, writer: anytype) !void {
    defer engine.allocator.free(req);
    const response = try engine.run(req);
    defer engine.allocator.free(response);
    try writer.writeAll(response);
}

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    const reader = std.io.getStdIn().reader();
    const writer = std.io.getStdOut().writer();
    var engine = Engine{ .allocator = allocator };
    var thread: ?std.Thread = null;
    while (true) {
        var line = std.ArrayList(u8).init(allocator);
        defer line.deinit();
        reader.streamUntilDelimiter(line.writer(), '\n', null) catch |err| switch (err) {
            error.EndOfStream => break,
            else => return err,
        };
        const request = std.mem.trim(u8, line.items, " \r");
        if (strEql(request, "quit")) {
            engine.stop();
            break;
        } else if (strEql(request, "stop")) {
            engine.stop();
        } else if (strStartsWith(request, "go")) {
            const req = try engine.allocator.dupe(u8, request);
            thread = try std.Thread.spawn(.{}, go, .{ &engine, req, writer });
        } else if (request.len > 0) {
            const response = try engine.run(request);
            try writer.writeAll(response);
        }
    }
    if (thread) |t| {
        t.join();
    }
}
