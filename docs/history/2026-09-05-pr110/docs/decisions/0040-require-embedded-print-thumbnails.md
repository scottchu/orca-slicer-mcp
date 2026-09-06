# 0040 — Require embedded thumbnails before print handoff

- Status: accepted workflow policy; automated enforcement unimplemented
- Date: 2026-09-02
- Owners: project maintainers
- Milestone: F0 / PREP-007 and HANDOFF-007

## Context

The user requires thumbnails as a repository rule. An observed CLI output had
thumbnail configuration but no embedded image blocks. Configuration therefore
cannot establish thumbnail presence or correspondence to the selected plate.
Private models, artifacts and image evidence remain outside the repository.

## Decision

Every prepared print artifact must contain genuine, decodable, nonempty
embedded thumbnails for its exact selected plate/layout. Before prepared
acceptance or upload, extract and decode those images, verify count, format
and dimensions against the selected backend/target requirements, and inspect
the selected objects, orientation and arrangement. Bind the result to the
final artifact hash and revision. No universal thumbnail size or format is
imposed without backend/target evidence.

A thumbnail setting, standalone preview, blank placeholder or another
revision's image is insufficient. Missing, corrupt, incompatible, stale or
unverified evidence blocks prepared acceptance and upload. Embedding or
replacing an image changes the artifact: renew validation, manifest and
authorization bindings before uploading those changed bytes.

After upload and before start, independently obtain target-parsed thumbnail
metadata for the uploaded artifact and compare count, dimensions and format
with local evidence as exposed by that target. Missing, conflicting or
unavailable verification blocks start. Earlier upload acknowledgement does
not satisfy this gate. Remote metadata verification is not a pre-upload
requirement.

## Consequences and evidence boundary

This policy applies to current unstarted jobs and future preparation. It adds
no printer-control authority, runtime enforcement, widget thumbnail feature,
plugin installation or service deployment. The preparation and operations
boundaries remain peers. Thumbnail checks establish visual correspondence;
they do not prove valid geometry, printability, safe motion or physical success.
Existing authorization and static G-code checks remain required.

## Validation

This documentation slice requires consistent AGENTS, requirements, preparation
knowledge and continuity records, independent exact-candidate review, and
unchanged application/build inputs. Backend automation needs separate non-user
fixture evidence for valid, absent, corrupt, blank and stale images. Target
metadata and physical display behavior need their own observed evidence;
neither is proved by this decision or a decodable local image.
