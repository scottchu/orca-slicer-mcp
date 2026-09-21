"""Synthetic contract tests; contain no user geometry or printer data."""
import hashlib
import unittest

from preview import parse, Unsupported


def fixture(commands, modes="G90\nM83"):
    return f"T2\n{modes}\n;LAYER_CHANGE\n;Z:0.2\nG92 E0\nG1 X0 Y0 Z0.2\n{commands}\n".encode()


class ParserTests(unittest.TestCase):
    def test_relative_extrusion_and_no_travel_geometry(self):
        raw = fixture("G1 X10 E1\nG1 X20\nG1 Y5 E1")
        result = parse(raw)
        self.assertEqual(result["sha256"], hashlib.sha256(raw).hexdigest())
        self.assertEqual(len(result["paths"]), 2)
        self.assertEqual(result["paths"][1]["points"][0], [20, 0, 0.2])

    def test_absolute_extrusion_reset_preserves_retraction_debt(self):
        result = parse(fixture("G1 X1 E1\nG1 E0\nG92 E100\nG1 X5 E100.5\nG1 X9 E101.5", "G90\nM82"))
        self.assertEqual(result["paths"][-1]["points"], [[7, 0, 0.2], [9, 0, 0.2]])

    def test_relative_xyz_and_g92_offsets(self):
        result = parse(fixture("G1 X10 E1\nG92 X0\nG1 X1 E1\nG91\nG1 X2 Y3 E1"))
        self.assertEqual(result["paths"][-1]["points"][-1], [13, 3, 0.2])

    def test_z_hop_does_not_create_layer(self):
        result = parse(fixture("G1 Z1\nG1 X2\nG1 Z.2\nG1 X3 E1"))
        self.assertEqual(len(result["layers"]), 1)
        self.assertEqual(result["bounds"][2], [0.2, 0.2])

    def test_full_circle_and_clockwise_arc(self):
        for opcode in ["G2", "G3"]:
            result = parse(fixture(f"{opcode} I1 J0 E1"))
            self.assertEqual(result["depositionArcs"], 1)
            self.assertGreater(len(result["paths"][0]["points"]), 30)
            self.assertAlmostEqual(result["bounds"][0][1], 2)

    def test_arc_partial_recovery_starts_after_debt(self):
        result = parse(fixture("G1 E-1\nG3 X2 I1 J0 E2"))
        self.assertAlmostEqual(result["paths"][0]["points"][0][0], 1)
        self.assertAlmostEqual(result["paths"][0]["points"][0][1], -1)

    def test_unsupported_dialect_fails(self):
        for command in ["G18", "G20", "G90.1", "G10", "G92", "G2 X2 R1 E1", "G2 X2 I1 P2 E1", "T3", "SET_GCODE_OFFSET X=1", "G1 Xnan E1", "G1 X1 X2 E1"]:
            with self.subTest(command=command), self.assertRaises(Unsupported):
                parse(fixture(command + "\nG1 X3 E1"))

    def test_unsupported_startup_modes_fail(self):
        with self.assertRaises(Unsupported):
            parse(b"G20\n" + fixture("G1 X1 E1"))

    def test_unknown_absolute_extrusion_baseline_fails(self):
        with self.assertRaises(Unsupported):
            parse(fixture("G1 X1 E5", "G90\nM82").replace(b"G92 E0\n", b""))

    def test_unknown_initial_position_and_missing_layer_z_fail(self):
        for old in [b"G1 X0 Y0 Z0.2\n", b";Z:0.2\n"]:
            with self.subTest(old=old), self.assertRaises(Unsupported):
                parse(fixture("G1 X1 E1").replace(old, b""))

    def test_startup_end_and_private_comments_not_retained(self):
        raw = b"; private name\nM83\nG1 X500 E10\n" + fixture("G1 X1 E1\nPRINT_END\nG1 X900 E100")
        result = parse(raw)
        self.assertEqual(result["bounds"][0], [0, 1])
        self.assertNotIn("private name", str(result))

    def test_unexpanded_macros_explicit(self):
        result = parse(fixture("TIMELAPSE_TAKE_FRAME\nDEFECT_DETECTION_DETECT\nG1 X1 E1"))
        self.assertEqual(result["opaqueMacros"], ["DEFECT_DETECTION_DETECT", "TIMELAPSE_TAKE_FRAME"])

    def test_input_budget(self):
        with self.assertRaises(Unsupported):
            parse(b" " * 20_000_001)


if __name__ == "__main__":
    unittest.main()
