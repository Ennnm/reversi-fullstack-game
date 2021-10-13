SELECT
  "game"."id",
  "game"."black_id" AS "blackId",
  "game"."white_id" AS "whiteId",
  "game"."winner_id" AS "winnerId",
  "blackPlayer"."id" AS "blackPlayer.id",
  "blackPlayer->user_status"."last_action" AS "blackPlayer.user_status.lastAction",
  "blackPlayer->user_status"."in_game" AS "inGame"
FROM
  "games" AS "game"
  LEFT OUTER JOIN (
    "users" AS "blackPlayer"
    INNER JOIN "user_statuses" AS "blackPlayer->user_status" ON "blackPlayer"."id" = "blackPlayer->user_status"."user_id"
    AND "blackPlayer->user_status"."last_action" >= '2021-10-12 06:12:25.103 +00:00'
    AND "blackPlayer->user_status"."in_game" = false
  ) ON "game"."black_id" = "blackPlayer"."id"
WHERE
  "game"."white_id" IS NULL
  AND "game"."winner_id" IS NULL;