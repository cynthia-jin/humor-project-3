@AGENTS.md

# Project Context

This is a **prompt chain management tool** for generating AI humor captions from images.

## Core Concepts
- A **humor flavor** is a set of ordered steps that run sequentially to create captions from an input image.
- Each **step** in the chain takes input from the previous step's output and produces new output.
- Example chain: (1) Image -> text description, (2) Description -> funny observations, (3) Observations -> five short captions.

## Required Functionality
- CRUD for humor flavors (create, read, update, delete)
- CRUD for humor flavor steps (create, read, update, delete)
- Reorder humor flavor steps (move step 2 to step 1, etc.)
- Read captions produced by a specific humor flavor
- Test a humor flavor by generating captions using the REST API
- Generate captions using an image test set

## Auth
- App only works for logged-in users where `profiles.is_superadmin == TRUE` or `profiles.is_matrix_admin == TRUE`

## External API
- REST API at `api.almostcrackd.ai` is used to generate captions for a given humor flavor
- Endpoints: presigned upload URL, upload image, register image URL, generate captions

## Tech Stack
- Next.js 16 with App Router, React 19, TypeScript
- Tailwind CSS 4 with dark/light/system theme support
- Supabase (PostgreSQL) with Google OAuth
- Server Actions for mutations, Server Components for data fetching

## Database Tables
- `humor_flavors` — id, slug, description, created_datetime_utc
- `humor_flavor_steps` — id, humor_flavor_id, order_by, llm_input_type_id, llm_output_type_id, llm_model_id, humor_flavor_step_type_id, llm_temperature, description, llm_system_prompt, llm_user_prompt, created_datetime_utc
- `captions` — id, content, is_public, is_featured, like_count, profile_id, image_id, humor_flavor_id, caption_request_id, llm_prompt_chain_id, created_datetime_utc
- `images` — id, url, is_common_use, created_datetime_utc
- `profiles` — id, is_superadmin, is_matrix_admin
