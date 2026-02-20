# Teams Management API - Backend Implementation Requirements

**Issue**: #560
**Status**: Frontend Ready - Awaiting Backend Implementation
**Priority**: High
**Repository**: AINative-Studio/core (backend)

---

## Executive Summary

The frontend Next.js application has a complete Teams management UI and service layer that calls `/v1/public/teams/*` endpoints. These endpoints **DO NOT EXIST** in the backend API yet and must be implemented.

**Frontend Status**: ✅ Complete and ready
**Backend Status**: ❌ Not implemented

---

## Required Backend Endpoints

All endpoints must be created under `/v1/public/teams/` with proper JWT authentication.

### 1. Team CRUD Operations

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| `GET` | `/v1/public/teams/` | List user's teams | Query params: `?organization_id={id}` (optional) | `TeamsResponse` |
| `POST` | `/v1/public/teams/` | Create new team | `CreateTeamData` | `Team` |
| `GET` | `/v1/public/teams/{team_id}` | Get team details | - | `Team` |
| `PUT` | `/v1/public/teams/{team_id}` | Update team | `UpdateTeamData` | `Team` |
| `DELETE` | `/v1/public/teams/{team_id}` | Delete team | - | `DeleteResponse` |

### 2. Team Member Management

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| `GET` | `/v1/public/teams/{team_id}/members` | List team members | - | `TeamMembersResponse` |
| `POST` | `/v1/public/teams/{team_id}/members` | Add member to team | `AddTeamMemberData` | `TeamMember` |
| `DELETE` | `/v1/public/teams/{team_id}/members/{user_id}` | Remove member | - | `DeleteResponse` |

---

## Data Models

### Request Types

```typescript
// Create Team Request
interface CreateTeamData {
  name: string;                    // Required: Team name
  description?: string;            // Optional: Team description
  organization_id: number;         // Required: Parent organization
}

// Update Team Request (partial update allowed)
interface UpdateTeamData {
  name?: string;                   // Optional: New team name
  description?: string;            // Optional: New description
}

// Add Team Member Request
interface AddTeamMemberData {
  user_id: number;                 // Required: User to add
  role: string;                    // Required: "member" | "lead"
}
```

### Response Types

```typescript
// Single Team Response
interface Team {
  id: number;
  name: string;
  description: string | null;
  organization_id: number;
  member_count?: number;           // Optional: Count of members
  created_at: string;              // ISO 8601 format
  updated_at: string;              // ISO 8601 format
}

// Teams List Response
interface TeamsResponse {
  teams: Team[];
  total: number;                   // Total count for pagination
}

// Single Member Response
interface TeamMember {
  id: number;                      // Team membership ID
  team_id: number;
  user_id: number;
  email: string;                   // User's email
  name: string;                    // User's display name
  role: string;                    // "member" | "lead"
  added_at: string;                // ISO 8601 format
}

// Team Members List Response
interface TeamMembersResponse {
  members: TeamMember[];
  total: number;
}

// Delete/Success Response
interface DeleteResponse {
  message: string;
}
```

---

## Authentication & Authorization

### Required Auth Checks

1. **JWT Authentication**: All endpoints require valid Bearer token
2. **Organization Membership**: User must be member of organization before accessing teams
3. **Team Permissions**:
   - **List Teams**: User must be org member
   - **Create Team**: User must have org admin or team creation permission
   - **View Team**: User must be team member or org admin
   - **Update Team**: User must be team lead or org admin
   - **Delete Team**: User must be team lead or org admin
   - **Add Member**: User must be team lead or org admin
   - **Remove Member**: User must be team lead or org admin (cannot remove self if only lead)

### Authorization Flow

```python
# Example authorization pseudocode
def check_team_access(user_id: int, team_id: int, action: str):
    team = get_team(team_id)

    # Check if user is org admin
    if is_org_admin(user_id, team.organization_id):
        return True

    # Check if user is team member
    membership = get_team_membership(user_id, team_id)
    if not membership:
        raise Forbidden("Not a team member")

    # Check role-based permissions
    if action in ['update', 'delete', 'add_member', 'remove_member']:
        if membership.role != 'lead':
            raise Forbidden("Team lead permission required")

    return True
```

---

## Database Schema Requirements

### Recommended Tables

```sql
-- teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_team_per_org UNIQUE (organization_id, name)
);

-- team_members table
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('member', 'lead')),
    added_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_per_team UNIQUE (team_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_teams_org_id ON teams(organization_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
```

---

## Business Rules

### Team Creation
- Team name must be unique within organization
- Team name: 1-255 characters, trimmed
- Description: optional, max 1000 characters
- Creator automatically becomes team lead

### Team Updates
- Only team leads and org admins can update
- At least one field required for update
- Name uniqueness validated on update

### Team Deletion
- Only team leads and org admins can delete
- Cascade deletes all team members
- Consider soft delete with `deleted_at` timestamp

### Member Management
- User must exist and be member of same organization
- Cannot add user already in team (return 409 Conflict)
- Cannot remove last team lead (must promote another first)
- Role must be 'member' or 'lead'

### Member Count
- `member_count` should be computed or cached
- Update when members added/removed
- Include in team list response for UI display

---

## Error Handling

### Expected Error Codes

| Code | Scenario | Response |
|------|----------|----------|
| `400` | Invalid request data | `{"detail": "Validation error: ..."}`
| `401` | Missing/invalid token | `{"detail": "Authentication required"}`
| `403` | Insufficient permissions | `{"detail": "Team lead permission required"}`
| `404` | Team not found | `{"detail": "Team not found"}`
| `409` | Duplicate member | `{"detail": "User already in team"}`
| `422` | Validation error | `{"detail": [{"loc": [...], "msg": "...", "type": "..."}]}`
| `500` | Server error | `{"detail": "Internal server error"}`

### FastAPI Validation

```python
from pydantic import BaseModel, Field, validator

class CreateTeamRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    organization_id: int = Field(..., gt=0)

    @validator('name')
    def validate_name(cls, v):
        return v.strip()

class UpdateTeamRequest(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)

    @validator('name')
    def validate_name(cls, v):
        if v:
            return v.strip()
        return v
```

---

## Testing Requirements

### Unit Tests Required

```python
# test_teams_router.py
class TestTeamsRouter:
    def test_create_team_success()
    def test_create_team_unauthorized()
    def test_create_team_duplicate_name()
    def test_create_team_invalid_org()

    def test_list_teams_for_user()
    def test_list_teams_filter_by_org()
    def test_list_teams_empty()

    def test_get_team_success()
    def test_get_team_not_found()
    def test_get_team_no_permission()

    def test_update_team_success()
    def test_update_team_no_permission()
    def test_update_team_duplicate_name()

    def test_delete_team_success()
    def test_delete_team_no_permission()
    def test_delete_team_cascades_members()

    def test_add_member_success()
    def test_add_member_duplicate()
    def test_add_member_invalid_user()
    def test_add_member_wrong_org()

    def test_list_members_success()
    def test_list_members_includes_user_info()

    def test_remove_member_success()
    def test_remove_member_last_lead_fails()
    def test_remove_member_no_permission()
```

### Integration Tests

- Test with real database (SQLite/PostgreSQL)
- Test JWT authentication flow
- Test concurrent member additions
- Test cascade deletions
- Minimum 85% code coverage

---

## Implementation Checklist

### Backend Implementation (core repository)

- [ ] Create `app/routers/teams.py` router
- [ ] Create `app/models/team.py` SQLAlchemy models
- [ ] Create `app/schemas/team.py` Pydantic schemas
- [ ] Create `app/services/team_service.py` business logic
- [ ] Add database migrations for `teams` and `team_members` tables
- [ ] Implement authentication middleware for `/v1/public/teams/*`
- [ ] Implement authorization checks for all endpoints
- [ ] Add rate limiting for team operations
- [ ] Create comprehensive unit tests (85%+ coverage)
- [ ] Create integration tests with test database
- [ ] Update OpenAPI/Swagger documentation
- [ ] Add logging for team operations
- [ ] Deploy to staging environment
- [ ] Test with frontend integration

### Frontend Updates (already completed ✅)

- [x] Update `lib/team-service.ts` endpoint prefix to `/v1/public/teams/`
- [x] Update all tests to use new endpoint prefix
- [x] Verify TypeScript compilation passes
- [x] Verify linting passes
- [x] Document backend requirements

---

## Frontend Integration Points

### Files Already Updated

1. **`/Users/aideveloper/core/AINative-website-nextjs/lib/team-service.ts`**
   - All 8 endpoints updated to use `/v1/public/teams/` prefix
   - TypeScript types fully defined
   - Error handling implemented

2. **`/Users/aideveloper/core/AINative-website-nextjs/lib/__tests__/team-service.test.ts`**
   - Comprehensive test coverage for all operations
   - All test expectations updated for new endpoints

3. **`/Users/aideveloper/core/AINative-website-nextjs/app/dashboard/teams/TeamsClient.tsx`**
   - Complete UI with React Query integration
   - Team CRUD operations
   - Member management interface
   - Loading states and error handling

### API Client Configuration

The frontend uses a centralized API client (`lib/api-client.ts`) with:
- Automatic JWT token injection from cookies
- Token refresh on 401 errors
- Comprehensive error message extraction
- Request timeout handling

**Base URL**: Configured in `lib/config/app.ts` (defaults to backend API URL)

---

## Example Backend Implementation

### Router Setup

```python
# app/routers/teams.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.auth.dependencies import get_current_user
from app.schemas.team import (
    CreateTeamRequest,
    UpdateTeamRequest,
    AddTeamMemberRequest,
    TeamResponse,
    TeamsListResponse,
    TeamMembersListResponse,
)
from app.services.team_service import TeamService

router = APIRouter(prefix="/v1/public/teams", tags=["teams"])

@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    data: CreateTeamRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new team within an organization."""
    team_service = TeamService(db)
    return team_service.create_team(current_user.id, data)

@router.get("/", response_model=TeamsListResponse)
async def list_teams(
    organization_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List teams the user has access to."""
    team_service = TeamService(db)
    return team_service.list_teams(current_user.id, organization_id)

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team details."""
    team_service = TeamService(db)
    return team_service.get_team(current_user.id, team_id)

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    data: UpdateTeamRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update team details."""
    team_service = TeamService(db)
    return team_service.update_team(current_user.id, team_id, data)

@router.delete("/{team_id}")
async def delete_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a team."""
    team_service = TeamService(db)
    team_service.delete_team(current_user.id, team_id)
    return {"message": "Team deleted successfully"}

@router.post("/{team_id}/members", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_team_member(
    team_id: int,
    data: AddTeamMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a member to the team."""
    team_service = TeamService(db)
    return team_service.add_member(current_user.id, team_id, data)

@router.get("/{team_id}/members", response_model=TeamMembersListResponse)
async def list_team_members(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all members of a team."""
    team_service = TeamService(db)
    return team_service.list_members(current_user.id, team_id)

@router.delete("/{team_id}/members/{user_id}")
async def remove_team_member(
    team_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a member from the team."""
    team_service = TeamService(db)
    team_service.remove_member(current_user.id, team_id, user_id)
    return {"message": "Member removed from team successfully"}
```

### Service Layer Example

```python
# app/services/team_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.team import Team, TeamMember
from app.models.user import User
from app.schemas.team import CreateTeamRequest, UpdateTeamRequest, AddTeamMemberRequest

class TeamService:
    def __init__(self, db: Session):
        self.db = db

    def create_team(self, user_id: int, data: CreateTeamRequest):
        # Verify user is member of organization
        self._verify_org_membership(user_id, data.organization_id)

        # Check for duplicate team name
        existing = self.db.query(Team).filter(
            Team.organization_id == data.organization_id,
            Team.name == data.name
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Team with this name already exists in organization"
            )

        # Create team
        team = Team(
            name=data.name,
            description=data.description,
            organization_id=data.organization_id
        )
        self.db.add(team)
        self.db.commit()
        self.db.refresh(team)

        # Add creator as team lead
        member = TeamMember(
            team_id=team.id,
            user_id=user_id,
            role='lead'
        )
        self.db.add(member)
        self.db.commit()

        return team

    def list_teams(self, user_id: int, organization_id: int | None = None):
        query = self.db.query(Team).join(TeamMember).filter(
            TeamMember.user_id == user_id
        )

        if organization_id:
            query = query.filter(Team.organization_id == organization_id)

        teams = query.all()
        return {
            "teams": teams,
            "total": len(teams)
        }

    def get_team(self, user_id: int, team_id: int):
        team = self._get_team_or_404(team_id)
        self._verify_team_access(user_id, team_id, 'view')
        return team

    def update_team(self, user_id: int, team_id: int, data: UpdateTeamRequest):
        team = self._get_team_or_404(team_id)
        self._verify_team_access(user_id, team_id, 'update')

        # Check for duplicate name if updating
        if data.name and data.name != team.name:
            existing = self.db.query(Team).filter(
                Team.organization_id == team.organization_id,
                Team.name == data.name,
                Team.id != team_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Team with this name already exists in organization"
                )

        # Update fields
        if data.name:
            team.name = data.name
        if data.description is not None:
            team.description = data.description

        self.db.commit()
        self.db.refresh(team)
        return team

    def delete_team(self, user_id: int, team_id: int):
        team = self._get_team_or_404(team_id)
        self._verify_team_access(user_id, team_id, 'delete')

        self.db.delete(team)
        self.db.commit()

    def add_member(self, user_id: int, team_id: int, data: AddTeamMemberRequest):
        team = self._get_team_or_404(team_id)
        self._verify_team_access(user_id, team_id, 'add_member')

        # Verify target user is in same organization
        self._verify_org_membership(data.user_id, team.organization_id)

        # Check for existing membership
        existing = self.db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == data.user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already in team"
            )

        # Add member
        member = TeamMember(
            team_id=team_id,
            user_id=data.user_id,
            role=data.role
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)

        return member

    def list_members(self, user_id: int, team_id: int):
        self._verify_team_access(user_id, team_id, 'view')

        members = self.db.query(TeamMember).join(User).filter(
            TeamMember.team_id == team_id
        ).all()

        return {
            "members": members,
            "total": len(members)
        }

    def remove_member(self, user_id: int, team_id: int, target_user_id: int):
        self._verify_team_access(user_id, team_id, 'remove_member')

        member = self.db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == target_user_id
        ).first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in team"
            )

        # Prevent removing last lead
        if member.role == 'lead':
            lead_count = self.db.query(TeamMember).filter(
                TeamMember.team_id == team_id,
                TeamMember.role == 'lead'
            ).count()
            if lead_count <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot remove last team lead"
                )

        self.db.delete(member)
        self.db.commit()

    def _get_team_or_404(self, team_id: int) -> Team:
        team = self.db.query(Team).filter(Team.id == team_id).first()
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )
        return team

    def _verify_team_access(self, user_id: int, team_id: int, action: str):
        # Implementation depends on your auth system
        pass

    def _verify_org_membership(self, user_id: int, org_id: int):
        # Implementation depends on your auth system
        pass
```

---

## Acceptance Criteria

### Backend (core repository)
- [ ] All 8 endpoints implemented under `/v1/public/teams/`
- [ ] JWT authentication enforced
- [ ] Role-based authorization implemented
- [ ] Database migrations created and tested
- [ ] Unit tests with 85%+ coverage
- [ ] Integration tests pass
- [ ] OpenAPI docs updated
- [ ] Deployed to staging environment

### Frontend (this repository) ✅ COMPLETE
- [x] `lib/team-service.ts` uses `/v1/public/teams/` prefix
- [x] All tests updated and passing
- [x] TypeScript compilation successful
- [x] Linting passes with no errors
- [x] Build succeeds

### Integration Testing
- [ ] Manual testing with Postman/curl
- [ ] Frontend connects to backend staging
- [ ] End-to-end user flow tested
- [ ] Error scenarios validated
- [ ] Performance tested (response times < 500ms)

---

## References

- **Issue**: #560
- **Frontend PR**: [To be created after backend is ready]
- **Backend Repo**: `AINative-Studio/core`
- **Frontend Service**: `/Users/aideveloper/core/AINative-website-nextjs/lib/team-service.ts`
- **Frontend Tests**: `/Users/aideveloper/core/AINative-website-nextjs/lib/__tests__/team-service.test.ts`
- **Frontend UI**: `/Users/aideveloper/core/AINative-website-nextjs/app/dashboard/teams/TeamsClient.tsx`

---

**Last Updated**: 2026-02-19
**Status**: Frontend complete, backend pending implementation
