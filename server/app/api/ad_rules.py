from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ad_rules import normalize_params, run_ad_rules
from app.db import get_db
from app.errors import AppError
from app.models import AdRule
from app.schemas import RuleOut, RulePatch, RuleRunOut

router = APIRouter()


@router.get("/ad-rules", response_model=list[RuleOut])
def list_ad_rules(session: Session = Depends(get_db)) -> list[RuleOut]:
    rules = session.scalars(select(AdRule).order_by(AdRule.id)).all()
    return [RuleOut.model_validate(rule) for rule in rules]


@router.patch("/ad-rules/{rule_id}", response_model=RuleOut)
def patch_ad_rule(rule_id: int, payload: RulePatch, session: Session = Depends(get_db)) -> RuleOut:
    rule = session.get(AdRule, rule_id)
    if rule is None:
        raise AppError(404, "ad_rule_not_found", "规则不存在")
    if "params" in payload.model_fields_set and payload.params is not None:
        rule.params = normalize_params(rule.kind, payload.params)
    if "enabled" in payload.model_fields_set and payload.enabled is not None:
        rule.enabled = payload.enabled
    session.flush()
    return RuleOut.model_validate(rule)


@router.post("/ad-rules/run", response_model=RuleRunOut)
def run_rules(session: Session = Depends(get_db)) -> RuleRunOut:
    return RuleRunOut.model_validate(run_ad_rules(session))
