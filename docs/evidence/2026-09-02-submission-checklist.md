# WebMCP Challenge Submission Checklist

- Review date: 2026-09-02 (Asia/Shanghai)
- Official deadline: 2026-09-03 13:00 Pacific Time (2026-09-04 04:00 Asia/Shanghai)
- Official challenge page: https://webmcp.devpost.com/
- Official rules: https://webmcp.devpost.com/rules
- OpenAI event page: https://openai.com/webmcp-challenge/
- Status: `in_progress`; this file is not an agreement to or submission under the Official Rules

The Official Rules and Hackathon Website prevail over this helper checklist and may change. Recheck both immediately before submission.

## Eligibility and authority

| Requirement                                                                           | Status                    | Evidence / action                                                                                               |
| ------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Entrant is at least the age of majority where they reside                             | `needs_user_confirmation` | User must confirm before submission                                                                             |
| Entrant residence or organization domicile is eligible                                | `needs_user_confirmation` | Rules exclude several locations, explicitly including China and Hong Kong; do not infer residence from timezone |
| Entrant is not excluded by employment, judge, affiliate, household, or conflict rules | `needs_user_confirmation` | User must review Official Rules §3                                                                              |
| Team/organization representative is authorized                                        | `needs_user_confirmation` | Confirm entrant type, members, and representative                                                               |
| Project has no prohibited Sponsor/Administrator financial or preferential support     | `needs_user_confirmation` | User ownership/support declaration required                                                                     |
| Entrant is registered on Devpost                                                      | `unknown`                 | Requires logged-in Devpost verification; no local Devpost state exists                                          |
| Entrant has read and agrees to the current Official Rules                             | `not_confirmed`           | Agreement must be explicit and occur before submit                                                              |

## Project and repository

| Requirement                                                          | Status          | Evidence / action                                                         |
| -------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------- |
| WebMCP-powered web application                                       | `passed_local`  | Exact eight-tool native Chrome evidence in Stage 2/4                      |
| Works consistently as described                                      | `passed_local`  | Full gates and 3/3 independent rehearsals                                 |
| New or meaningfully extended during Aug 25–Sep 3 period              | `passed_local`  | Repository implementation commits dated Sep 2, 2026; preserve Git history |
| Authorized third-party SDK/API/data use                              | `in_progress`   | Dependency license inventory and attribution review pending               |
| Public source repository                                             | `passed_public` | https://github.com/nice-hang/json-render-ai opened logged out on Sep 2    |
| All source, assets, and functional instructions present              | `in_progress`   | Final clean-clone gate pending                                            |
| Detectable open-source license                                       | `in_progress`   | MIT `LICENSE` prepared locally; recheck after push                        |
| WebMCP registration visible in repository                            | `passed_local`  | `src/adapters/webmcp/tools.ts` and README registration section            |
| Repository has no credentials, private data, or local absolute paths | `in_progress`   | Final tracked-file and secret scans pending                               |

## Required materials

| Requirement                                                                   | Status                    | Evidence / action                                                              |
| ----------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------ |
| Working live URL accessible to judges                                         | `blocked_authorization`   | Deployment not yet authorized                                                  |
| Free judging/testing access through end of judging                            | `blocked_authorization`   | Choose host and keep URL available through Sep 21, 2026                        |
| English description covers fit, UX, human/Agent collaboration, implementation | `prepared_local`          | `devpost-submission.md`                                                        |
| Public repository URL                                                         | `passed_public`           | https://github.com/nice-hang/json-render-ai                                    |
| Demo video is under 3 minutes                                                 | `prepared_script_only`    | `docs/DEMO_SCRIPT.md`; recording/publication pending                           |
| Demo video clearly shows functionality and WebMCP with audio                  | `prepared_script_only`    | Script covers the required flow; must record with narration                    |
| Demo video is publicly visible on YouTube                                     | `blocked_authorization`   | Public video not authorized                                                    |
| Video avoids unauthorized trademarks, music, and copyrighted material         | `needs_user_confirmation` | Use application-only visuals, original narration, and no music unless licensed |
| At least three truthful screenshots                                           | `passed_local`            | `docs/assets/` generated by native Chrome screenshot lane                      |
| All submitted materials are English or translated                             | `prepared_local`          | README and draft are English; narration must be English or translated          |

## Final external actions

- [ ] User confirms every `needs_user_confirmation` item above.
- [ ] User explicitly authorizes deployment and chosen hosting provider.
- [ ] Verify deployed HTTPS URL logged out and run the complete WebMCP demo twice.
- [ ] Record, review, and explicitly authorize public YouTube upload.
- [ ] Re-open the repository logged out; verify README images and GitHub license detection.
- [ ] Re-open Official Rules and submission form on submission day; resolve every `unknown`.
- [ ] Present the exact final title, description, member list, URLs, and assets to the user.
- [ ] Receive explicit final submit confirmation.
- [ ] Submit through Devpost and verify the resulting public project page separately.
