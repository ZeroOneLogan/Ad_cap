// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "AdCapPlus",
    platforms: [
        .iOS(.v17),
        .macOS(.v13)
    ],
    products: [
        .library(
            name: "AdCapCore",
            targets: ["AdCapCore"]
        )
    ],
    targets: [
        .target(
            name: "AdCapCore",
            path: "Sources/AdCapCore"
        ),
        .testTarget(
            name: "AdCapCoreTests",
            dependencies: ["AdCapCore"],
            path: "Tests/AdCapCoreTests"
        )
    ]
)
